import { execFileSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { dismissSession } from "../dismissSession";
import { resolveCloseDurability } from "./resolveCloseDurability";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./treeDurability", () => ({
	checkDurability: vi.fn(() => Promise.resolve({ durable: true })),
}));
vi.mock("./reapWorktree", () => ({
	reapWorktree: vi.fn((path: string) => {
		rmSync(path, { recursive: true, force: true });
		return Promise.resolve({ removed: true });
	}),
}));

const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const created: string[] = [];

afterEach(() => {
	vi.clearAllMocks();
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

function makeCloneWithWorktree(): { clone: string; tree: string } {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "close-reap-")));
	created.push(base);
	const clone = join(base, "repo");
	const tree = join(base, "repo-2");
	mkdirSync(clone);
	const git = (...args: string[]) => execFileSync("git", args, { cwd: clone });
	git("init", "-b", "main");
	git("config", "user.email", "test@example.com");
	git("config", "user.name", "test");
	writeFileSync(join(clone, "README.md"), "x");
	git("add", ".");
	git("commit", "-m", "init");
	git("worktree", "add", "-b", "repo-2", tree);
	return { clone, tree };
}

function session(id: string, overrides: Partial<Session>): Session {
	return {
		id,
		name: `Session ${id}`,
		commandType: "claude",
		status: "waiting",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		waitingSince: 1,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("resolveCloseDurability", () => {
	it("reaps the clone's watcher when its last session closes from a reaped worktree", async () => {
		const { clone, tree } = makeCloneWithWorktree();
		const watcher = session("1", { cwd: clone, watcher: true });
		const worker = session("2", { cwd: tree, worktree: { path: tree, clone } });
		const sessions = new Map([
			[watcher.id, watcher],
			[worker.id, worker],
		]);

		await resolveCloseDurability(
			worker,
			() => dismissSession(sessions, worker.id),
			vi.fn(),
		);

		expect(sessions.size).toBe(0);
		expect(logMock).toHaveBeenCalledWith(
			`reaping watcher session 1 for the clone ${clone}: its last session 2 was dismissed`,
		);
	});
});
