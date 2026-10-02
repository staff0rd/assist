import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeActivity } from "../../../shared/emitActivity";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { reuseSessionForRun } from "./reuseSessionForRun";
import { spawnPty } from "./spawnPty";
import { wirePtyEvents } from "./wirePtyEvents";
import { bindNewWorktree } from "./worktree/bindNewWorktree";
import { ensureWatcher } from "./worktree/ensureWatcher";
import { planReuseTree } from "./worktree/planReuseTree";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
		kill: vi.fn(),
	})),
}));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("./worktree/planReuseTree", () => ({
	planReuseTree: vi.fn(() => undefined),
}));
vi.mock("./worktree/bindNewWorktree", () => ({ bindNewWorktree: vi.fn() }));
vi.mock("./worktree/ensureWatcher", () => ({ ensureWatcher: vi.fn() }));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;
const wirePtyMock = wirePtyEvents as unknown as ReturnType<typeof vi.fn>;
const removeActivityMock = removeActivity as unknown as ReturnType<
	typeof vi.fn
>;

function makeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "7",
		name: "assist draft --once",
		commandType: "assist",
		status: "done",
		startedAt: 100,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		scrollback: "draft transcript",
		assistArgs: ["draft", "--once"],
		cwd: "/home/user/repo",
		...overrides,
	};
}

describe("reuseSessionForRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("swaps args and name to the backlog run and respawns on the same id", () => {
		const session = makeSession();

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.assistArgs).toEqual(["backlog", "run", "42"]);
		expect(session.name).toBe("assist backlog run 42");
		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "42"],
			"/home/user/repo",
			"7",
		);
	});

	it("resets status to running and refreshes startedAt", () => {
		const session = makeSession({ startedAt: 100 });

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.status).toBe("running");
		expect(session.startedAt).toBeGreaterThan(100);
	});

	it("clears scrollback so the draft tail is not shown under the run", () => {
		const session = makeSession({ scrollback: "draft transcript" });

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.scrollback).toBe("");
	});

	it("broadcasts a clear so terminals drop the draft output", () => {
		const client: SessionClient = { send: vi.fn() };
		const session = makeSession();

		reuseSessionForRun(session, 42, new Set([client]), vi.fn());

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "clear", sessionId: "7" }),
		);
	});

	it("resets stale draft activity on the reused session", () => {
		const session = makeSession({
			activity: {
				kind: "command",
				name: "draft",
				startedAt: 100,
			},
		});

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.activity).toBeUndefined();
		expect(removeActivityMock).toHaveBeenCalledWith("7");
	});

	it("re-wires pty events on the reused session", () => {
		const session = makeSession();
		const onStatusChange = vi.fn();
		const clients = new Set<SessionClient>();

		reuseSessionForRun(session, 42, clients, onStatusChange);

		expect(wirePtyMock).toHaveBeenCalledWith(session, clients, onStatusChange);
	});

	it("kills a still-running pty before respawning", () => {
		const kill = vi.fn();
		const session = makeSession({
			status: "running",
			pty: { kill } as unknown as Session["pty"],
		});

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(kill).toHaveBeenCalledOnce();
	});

	it("kills the old pty even when the draft is already done", () => {
		const kill = vi.fn();
		const session = makeSession({
			status: "done",
			pty: { kill } as unknown as Session["pty"],
		});

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(kill).toHaveBeenCalledOnce();
	});

	describe("when the chained run needs its own workspace", () => {
		const alloc = {
			cwd: "/home/user/repo-2",
			kind: "worktree" as const,
			created: true,
			clone: "/home/user/repo",
		};

		function treeCtx(): TreeSpawnContext {
			return {
				sessions: new Map(),
				spawnWith: vi.fn(),
				notify: vi.fn(),
				startHeld: vi.fn(),
			};
		}

		beforeEach(() => {
			vi.mocked(planReuseTree).mockReturnValue(alloc);
		});

		it("moves the reused card into the allocated workspace", () => {
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());

			expect(session.cwd).toBe("/home/user/repo-2");
			expect(vi.mocked(bindNewWorktree).mock.calls[0]?.[1]).toEqual(alloc);
		});

		it("holds the run until the workspace has been seeded", () => {
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());

			expect(spawnPtyMock).not.toHaveBeenCalled();
			expect(session.pty).toBeNull();
			expect(session.pendingStart).toBeTypeOf("function");
			expect(wirePtyMock).not.toHaveBeenCalled();
		});

		it("starts the held run in the new workspace once seeding releases it", () => {
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());
			session.pendingStart?.();

			expect(spawnPtyMock).toHaveBeenCalledWith(
				["assist", "backlog", "run", "42"],
				"/home/user/repo-2",
				"7",
			);
		});

		it("starts immediately when the allocator leaves it where it is", () => {
			vi.mocked(planReuseTree).mockReturnValue(undefined);
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());

			expect(session.pendingStart).toBeUndefined();
			expect(spawnPtyMock).toHaveBeenCalledOnce();
			expect(bindNewWorktree).not.toHaveBeenCalled();
		});

		it("asks the allocator for a backlog-run workspace that can take the run's commits", () => {
			const session = makeSession();
			const tree = treeCtx();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), tree);

			expect(planReuseTree).toHaveBeenCalledWith(session, tree, {
				commits: true,
				backlogRun: true,
			});
		});
	});

	describe("keeping the clone watched", () => {
		function treeCtx(): TreeSpawnContext {
			return {
				sessions: new Map(),
				spawnWith: vi.fn(),
				notify: vi.fn(),
				startHeld: vi.fn(),
			};
		}

		beforeEach(() => {
			vi.mocked(planReuseTree).mockReturnValue(undefined);
		});

		it("ensures a watcher for the clone the chained run came from", () => {
			const session = makeSession();
			const tree = treeCtx();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), tree);

			expect(ensureWatcher).toHaveBeenCalledWith(tree, "/home/user/repo");
		});

		it("resolves the clone from where the session sat, not the workspace it moved to", () => {
			vi.mocked(planReuseTree).mockReturnValue({
				cwd: "/home/user/repo-2",
				kind: "worktree",
				created: true,
				clone: "/home/user/repo",
			});
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());

			expect(ensureWatcher).toHaveBeenCalledWith(
				expect.anything(),
				"/home/user/repo",
			);
		});

		it("ensures no watcher when the run is not daemon-allocated", () => {
			reuseSessionForRun(makeSession(), 42, new Set(), vi.fn());

			expect(ensureWatcher).not.toHaveBeenCalled();
		});

		it("ensures no watcher when the chained run never starts", () => {
			spawnPtyMock.mockImplementationOnce(() => {
				throw new Error("too many live sessions");
			});

			reuseSessionForRun(makeSession(), 42, new Set(), vi.fn(), treeCtx());

			expect(ensureWatcher).not.toHaveBeenCalled();
		});
	});

	describe("when the workspace cannot be created", () => {
		function treeCtx(): TreeSpawnContext {
			return {
				sessions: new Map(),
				spawnWith: vi.fn(),
				notify: vi.fn(),
				startHeld: vi.fn(),
			};
		}

		beforeEach(() => {
			vi.mocked(planReuseTree).mockImplementation(() => {
				throw new Error("git worktree add failed: no space left on device");
			});
		});

		it("fails the card instead of throwing out of the status-change handler", () => {
			const session = makeSession();

			expect(() =>
				reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx()),
			).not.toThrow();

			expect(session.status).toBe("error");
			expect(session.error).toContain(
				"git worktree add failed: no space left on device",
			);
		});

		it("never starts the run in the tree the session was sitting in", () => {
			const session = makeSession();

			reuseSessionForRun(session, 42, new Set(), vi.fn(), treeCtx());

			expect(spawnPtyMock).not.toHaveBeenCalled();
			expect(session.pty).toBeNull();
			expect(session.pendingStart).toBeUndefined();
			expect(bindNewWorktree).not.toHaveBeenCalled();
			expect(session.cwd).toBe("/home/user/repo");
		});

		it("shows the reason on the card and refreshes it", () => {
			const client: SessionClient = { send: vi.fn() };
			const tree = treeCtx();

			reuseSessionForRun(makeSession(), 42, new Set([client]), vi.fn(), tree);

			expect(
				vi
					.mocked(client.send)
					.mock.calls.map(([message]) => message)
					.join(""),
			).toContain("no space left on device");
			expect(tree.notify).toHaveBeenCalled();
		});
	});
});
