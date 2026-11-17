import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkDurabilitySync } from "../sessions/daemon/worktree/treeDurability";
import { reinstallChangedDeps } from "./reinstallChangedDeps";
import { syncReusedCheckout } from "./syncReusedCheckout";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("./reinstallChangedDeps", () => ({ reinstallChangedDeps: vi.fn() }));

const created: string[] = [];
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

function runGit(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd: string, name: string): void {
	writeFileSync(join(cwd, name), name);
	runGit(cwd, "add", ".");
	runGit(cwd, "commit", "-q", "-m", name);
}

function identify(cwd: string): void {
	runGit(cwd, "config", "user.email", "test@example.com");
	runGit(cwd, "config", "user.name", "test");
}

function reusedPrCheckout() {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "reused-pr-")));
	created.push(base);
	const author = join(base, "author");
	const upstream = join(base, "upstream.git");
	const clone = join(base, "clone");
	runGit(base, "init", "-q", "-b", "main", author);
	identify(author);
	commit(author, "base");
	runGit(author, "checkout", "-q", "-b", "feat");
	commit(author, "feat-1");
	runGit(base, "clone", "-q", "--bare", author, upstream);
	runGit(author, "remote", "add", "origin", upstream);
	runGit(base, "clone", "-q", "-b", "main", upstream, clone);
	identify(clone);
	runGit(clone, "checkout", "-q", "-b", "feat", "origin/feat");
	const forcePush = () => {
		runGit(author, "reset", "-q", "--hard", "main");
		commit(author, "feat-rewritten");
		runGit(author, "push", "-q", "--force", "origin", "feat");
		runGit(upstream, "update-ref", "refs/pull/7/head", "refs/heads/feat");
		return runGit(author, "rev-parse", "HEAD");
	};
	return { clone, forcePush };
}

function sync(clone: string): Promise<void> {
	vi.spyOn(process, "cwd").mockReturnValue(clone);
	return syncReusedCheckout("7", "feat", "refs/pull/7/head");
}

describe("syncReusedCheckout", () => {
	it("moves a force-pushed PR branch to the PR's current head", async () => {
		const { clone, forcePush } = reusedPrCheckout();
		const before = runGit(clone, "rev-parse", "HEAD");
		const head = forcePush();

		await sync(clone);

		expect(runGit(clone, "rev-parse", "HEAD")).toBe(head);
		expect(runGit(clone, "status", "--porcelain")).toBe("");
		expect(reinstallChangedDeps).toHaveBeenCalledWith(clone, before);
		expect(checkDurabilitySync(clone)).toEqual({ durable: true });
	});

	it("leaves a branch holding local commits untouched and says so", async () => {
		const { clone, forcePush } = reusedPrCheckout();
		commit(clone, "local-work");
		const local = runGit(clone, "rev-parse", "HEAD");
		forcePush();

		await sync(clone);

		expect(runGit(clone, "rev-parse", "HEAD")).toBe(local);
		expect(String(warn.mock.calls[0][0])).toContain(
			"may differ from PR #7's head",
		);
	});

	it("leaves a tree with uncommitted changes untouched", async () => {
		const { clone, forcePush } = reusedPrCheckout();
		const before = runGit(clone, "rev-parse", "HEAD");
		writeFileSync(join(clone, "feat-1"), "edited");
		forcePush();

		await sync(clone);

		expect(runGit(clone, "rev-parse", "HEAD")).toBe(before);
		expect(String(warn.mock.calls[0][0])).toContain("uncommitted changes");
	});
});

describe("checkDurabilitySync on a reused PR branch", () => {
	it("does not report unpushed commits for a stale branch created from the remote", () => {
		const { clone, forcePush } = reusedPrCheckout();
		forcePush();
		runGit(clone, "fetch", "-q", "--prune", "origin");

		expect(checkDurabilitySync(clone)).toEqual({ durable: true });
	});

	it("reports unpushed commits made on top of the remote-set tip", () => {
		const { clone, forcePush } = reusedPrCheckout();
		commit(clone, "local-work");
		forcePush();
		runGit(clone, "fetch", "-q", "--prune", "origin");

		expect(checkDurabilitySync(clone)).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});
});
