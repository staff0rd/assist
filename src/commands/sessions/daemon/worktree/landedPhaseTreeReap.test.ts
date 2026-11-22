import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../types";
import { resolveCloseDurability } from "./resolveCloseDurability";
import { checkDurability, checkDurabilitySync } from "./treeDurability";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./readWorktreeRegistry", () => ({
	forgetWorktree: vi.fn(),
	worktreeAttributionIncludingReaped: vi.fn(() => undefined),
}));
vi.mock("./removeBindMountContainers", () => ({
	removeBindMountContainers: vi.fn(() => Promise.resolve()),
}));

const created: string[] = [];

afterEach(() => {
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

const identity = {
	GIT_AUTHOR_NAME: "test",
	GIT_AUTHOR_EMAIL: "test@example.com",
	GIT_COMMITTER_NAME: "test",
	GIT_COMMITTER_EMAIL: "test@example.com",
};

function gitIn(cwd: string) {
	return (...args: string[]) =>
		execFileSync("git", args, {
			cwd,
			env: { ...process.env, ...identity },
			stdio: "pipe",
		})
			.toString()
			.trim();
}

function commitFile(cwd: string, file: string, message: string) {
	writeFileSync(join(cwd, file), message);
	gitIn(cwd)("add", file);
	gitIn(cwd)("commit", "-m", message);
}

function landedPhase() {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "landed-phase-")));
	created.push(base);
	const origin = join(base, "origin.git");
	const clone = join(base, "repo");
	const other = join(base, "other");
	const itemTree = join(base, "repo-4");
	const phaseTree = join(base, "repo-6");
	gitIn(base)("init", "--bare", "-b", "main", origin);
	gitIn(base)("clone", origin, other);
	commitFile(other, "README.md", "init");
	gitIn(other)("push", "origin", "main");
	gitIn(base)("clone", origin, clone);
	gitIn(clone)("worktree", "add", "-b", "repo-4", itemTree, "origin/main");
	gitIn(clone)("worktree", "add", "-b", "repo-6", phaseTree, "repo-4");
	commitFile(phaseTree, "phase3.ts", "fix: phase 3");
	gitIn(itemTree)("merge", "--ff-only", "repo-6");
	commitFile(other, "phase1.ts", "feat: phase 1");
	gitIn(other)("push", "origin", "main");
	const rebaseAndPush = () => {
		gitIn(itemTree)("fetch", "origin");
		gitIn(itemTree)("rebase", "origin/main");
		gitIn(itemTree)("push", "origin", "HEAD:main");
		gitIn(phaseTree)("fetch", "origin");
	};
	return { clone, itemTree, phaseTree, rebaseAndPush, git: gitIn(phaseTree) };
}

describe("a phase tree landed into an item tree that rebased before pushing", () => {
	it("holds the phase tree until the item tree pushes the rebased commit", async () => {
		const { phaseTree, rebaseAndPush } = landedPhase();

		expect(await checkDurability(phaseTree)).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
		rebaseAndPush();

		expect(await checkDurability(phaseTree)).toEqual({ durable: true });
		expect(checkDurabilitySync(phaseTree)).toEqual({ durable: true });
	});

	it("still holds the phase tree when it also has a commit that never landed", async () => {
		const { phaseTree, rebaseAndPush } = landedPhase();
		rebaseAndPush();
		commitFile(phaseTree, "stray.ts", "fix: never landed");

		expect(await checkDurability(phaseTree)).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
		expect(checkDurabilitySync(phaseTree)).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});

	it("closes and reaps a stopped done-phase session once its restart exits", async () => {
		const { clone, phaseTree, rebaseAndPush, git } = landedPhase();
		const session = makeSession({
			id: "6",
			status: "running",
			cwd: phaseTree,
			worktree: { path: phaseTree, clone },
		});
		const stoppedFinalize = vi.fn();
		await resolveCloseDurability(session, stoppedFinalize, vi.fn());
		session.gitWatcher?.close();
		session.gitWatcher = undefined;
		expect(session.status).toBe("stopped");
		expect(session.undurable?.reason).toBe("unpushed commits");
		expect(git("rev-parse", "HEAD")).not.toBe(
			gitIn(clone)("rev-parse", "origin/main"),
		);

		rebaseAndPush();
		session.status = "running";
		session.closing = true;
		const finalize = vi.fn();
		await resolveCloseDurability(session, finalize, vi.fn());

		expect(stoppedFinalize).not.toHaveBeenCalled();
		expect(finalize).toHaveBeenCalledOnce();
		expect(session.undurable).toBeUndefined();
		expect(session.worktree).toBeUndefined();
		expect(existsSync(phaseTree)).toBe(false);
		expect(gitIn(clone)("branch", "--list", "repo-6")).toBe("");
	});
});

function runPhaseSession(clone: string, phaseTree: string, itemTree: string) {
	return makeSession({
		id: "6",
		commandType: "assist",
		assistArgs: ["backlog", "run-phase", "a1", "3", "--item-tree", itemTree],
		status: "running",
		closing: true,
		cwd: phaseTree,
		worktree: { path: phaseTree, clone },
	});
}

function closeSettled(session: Session) {
	return async () => {
		const finalize = vi.fn();
		await resolveCloseDurability(session, finalize, vi.fn());
		session.gitWatcher?.close();
		session.gitWatcher = undefined;
		return finalize;
	};
}

describe("a run-phase session landed into an item tree that has not pushed", () => {
	it("treats the phase tree as durable against its item tree", async () => {
		const { phaseTree, itemTree } = landedPhase();

		expect(await checkDurability(phaseTree, itemTree)).toEqual({
			durable: true,
		});
	});

	it("closes the session and reaps its worktree and branch", async () => {
		const { clone, itemTree, phaseTree } = landedPhase();
		const session = runPhaseSession(clone, phaseTree, itemTree);

		const finalize = await closeSettled(session)();

		expect(finalize).toHaveBeenCalledOnce();
		expect(session.undurable).toBeUndefined();
		expect(session.worktree).toBeUndefined();
		expect(existsSync(phaseTree)).toBe(false);
		expect(gitIn(clone)("branch", "--list", "repo-6")).toBe("");
	});

	it("holds the phase tree when it has a commit the item tree lacks", async () => {
		const { clone, itemTree, phaseTree } = landedPhase();
		commitFile(phaseTree, "stray.ts", "fix: never landed");
		const session = runPhaseSession(clone, phaseTree, itemTree);

		const finalize = await closeSettled(session)();

		expect(finalize).not.toHaveBeenCalled();
		expect(session.undurable?.reason).toBe("unpushed commits");
		expect(existsSync(phaseTree)).toBe(true);
	});

	it("holds the phase tree when it has uncommitted changes", async () => {
		const { phaseTree, itemTree } = landedPhase();
		writeFileSync(join(phaseTree, "wip.ts"), "wip");

		expect(await checkDurability(phaseTree, itemTree)).toEqual({
			durable: false,
			reason: "uncommitted changes",
		});
	});

	it("falls back to the remote check when the item tree is gone", async () => {
		const { clone, itemTree, phaseTree } = landedPhase();
		gitIn(clone)("worktree", "remove", "--force", itemTree);

		expect(await checkDurability(phaseTree, itemTree)).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});
});
