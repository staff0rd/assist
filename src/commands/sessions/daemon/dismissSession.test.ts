import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./worktree/canonicalTreePath", () => ({
	canonicalTreePath: (path: string) => path,
}));
vi.mock("./worktree/resolveClone", () => ({
	resolveClone: (cwd: string) =>
		cwd.startsWith("/git/repo") ? "/git/repo" : cwd,
}));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve({ removed: true })),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: { pid: 7, kill: vi.fn() } as unknown as Session["pty"],
		scrollback: "",
		...overrides,
	};
}

describe("dismissSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("group-kills the process tree rather than the pty leader alone", () => {
		const s = session();

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(killMock).toHaveBeenCalledWith(s.pty);
	});

	it("reaps the worktree of the last card holding it", () => {
		const s = session({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(reapMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("never reaps a worktree another card is still working in", () => {
		const agent = session({
			id: "1",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sibling = session({
			id: "2",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([
			[agent.id, agent],
			[sibling.id, sibling],
		]);

		dismissSession(sessions, agent.id);

		expect(reapMock).not.toHaveBeenCalled();
		expect(sessions.get("2")).toBe(sibling);
	});
});

describe("dismissSession watcher reaping", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const watcher = () =>
		session({ id: "w", cwd: "/git/repo", watcher: true, starred: true });

	function sessionsOf(...list: Session[]) {
		return new Map(list.map((s) => [s.id, s]));
	}

	it("dismisses the clone's watcher with its last session and logs the reap", () => {
		const run = session({ id: "1", cwd: "/git/repo-2" });
		const sessions = sessionsOf(run, watcher());

		dismissSession(sessions, run.id);

		expect(sessions.size).toBe(0);
		expect(daemonLog).toHaveBeenCalledWith(
			"reaping watcher session w for the clone /git/repo: its last session 1 was dismissed",
		);
	});

	it("keeps the watcher while a session remains in the clone or a worktree", () => {
		for (const cwd of ["/git/repo", "/git/repo-3"]) {
			const run = session({ id: "1", cwd: "/git/repo-2" });
			const other = session({ id: "2", cwd, status: "done" });
			const sessions = sessionsOf(run, other, watcher());

			dismissSession(sessions, run.id);

			expect(sessions.has("w")).toBe(true);
		}
	});

	it("does not let a session in another clone keep the watcher alive", () => {
		const run = session({ id: "1", cwd: "/git/repo-2" });
		const elsewhere = session({ id: "2", cwd: "/git/other" });
		const sessions = sessionsOf(run, elsewhere, watcher());

		dismissSession(sessions, run.id);

		expect([...sessions.keys()]).toEqual(["2"]);
	});

	it("reaps nothing further when the watcher itself is dismissed", () => {
		const second = session({ id: "v", cwd: "/git/repo", watcher: true });
		const sessions = sessionsOf(watcher(), second);

		dismissSession(sessions, "w");

		expect([...sessions.keys()]).toEqual(["v"]);
		expect(daemonLog).not.toHaveBeenCalledWith(
			expect.stringContaining("reaping watcher"),
		);
	});
});
