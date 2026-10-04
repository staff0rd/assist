import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { applyStatusChange } from "./applyStatusChange";
import type { StatusChangeDeps } from "./finishStatusChange";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./flushPhaseActiveMs", () => ({
	flushPhaseActiveMs: vi.fn(() => Promise.resolve()),
}));
vi.mock("./worktree/resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));
vi.mock("./startTranscriptTitleGeneration", () => ({
	startTranscriptTitleGeneration: vi.fn(),
}));

const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;
const titleMock = startTranscriptTitleGeneration as unknown as ReturnType<
	typeof vi.fn
>;

function deps(overrides: Partial<StatusChangeDeps> = {}): StatusChangeDeps {
	return {
		dismiss: vi.fn(),
		notify: vi.fn(),
		reuseForRun: vi.fn(),
		...overrides,
	};
}

describe("applyStatusChange divergence escalation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("escalates when a watcher exits 3", () => {
		const watcher = makeSession({ watcher: true, status: "running" });
		const escalateDivergence = vi.fn();

		applyStatusChange(watcher, "error", 3, deps({ escalateDivergence }));

		expect(escalateDivergence).toHaveBeenCalledWith(watcher);
	});

	it.each([1, 130])("does not escalate a watcher that exits %i", (code) => {
		const watcher = makeSession({ watcher: true, status: "running" });
		const escalateDivergence = vi.fn();

		applyStatusChange(watcher, "error", code, deps({ escalateDivergence }));

		expect(escalateDivergence).not.toHaveBeenCalled();
	});

	it("does not escalate a non-watcher session that exits 3", () => {
		const session = makeSession({ status: "running" });
		const escalateDivergence = vi.fn();

		applyStatusChange(session, "error", 3, deps({ escalateDivergence }));

		expect(escalateDivergence).not.toHaveBeenCalled();
	});
});

describe("applyStatusChange worktree reap gating", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("never reaps a worktree-backed backlog run between phase transitions", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
		});
		const dismiss = vi.fn();

		applyStatusChange(session, "waiting", undefined, deps({ dismiss }));
		applyStatusChange(session, "running", undefined, deps({ dismiss }));
		applyStatusChange(session, "waiting", undefined, deps({ dismiss }));

		expect(resolveMock).not.toHaveBeenCalled();
		expect(dismiss).not.toHaveBeenCalled();
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("routes through the durability gate only on the final done transition", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "waiting",
		});

		applyStatusChange(session, "done", 0, deps());

		expect(resolveMock).toHaveBeenCalledTimes(1);
		expect(resolveMock).toHaveBeenCalledWith(
			session,
			expect.any(Function),
			expect.any(Function),
		);
		expect(session.status).toBe("waiting");
	});

	it("keeps the worktree when a done transition chains straight into an auto-run", () => {
		const session = makeSession({
			commandType: "assist",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
			name: "assist draft --once something",
			assistArgs: ["draft", "--once", "something"],
			autoRun: true,
			activity: {
				kind: "command",
				name: "draft",
				itemId: 772,
				startedAt: 1,
			},
		});
		const reuseForRun = vi.fn();

		applyStatusChange(session, "done", 0, deps({ reuseForRun }));

		expect(resolveMock).not.toHaveBeenCalled();
		expect(reuseForRun).toHaveBeenCalledWith(session, 772);
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("keeps the workspace when another agent in that stream is still working", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
		});
		const dismiss = vi.fn();

		applyStatusChange(session, "done", 0, deps({ dismiss }), () => true);

		expect(resolveMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.closing).toBeUndefined();
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("runs the gate on done once no other agent shares the workspace", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
		});

		applyStatusChange(session, "done", 0, deps(), () => false);

		expect(resolveMock).toHaveBeenCalledTimes(1);
	});

	it("skips the gate for a done transition on a non-worktree session", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			status: "waiting",
		});

		applyStatusChange(session, "done", 0, deps());

		expect(resolveMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
	});
});

describe("applyStatusChange undurable hold reason", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("keeps the hold reason when the card is held as stopped", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "waiting",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "stopped", undefined, deps());

		expect(session.undurable).toEqual({ reason: "unpushed commits" });
	});

	it("clears a stale hold reason once the card leaves stopped", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "stopped",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "running", undefined, deps());

		expect(session.undurable).toBeUndefined();
	});

	it("clears a stale hold reason on a waiting phase transition", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "waiting", undefined, deps());

		expect(session.undurable).toBeUndefined();
	});

	it("retries the transcript title when a card parks at waiting", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "running",
		});
		const notify = vi.fn();

		applyStatusChange(session, "waiting", undefined, deps({ notify }));

		expect(titleMock).toHaveBeenCalledWith(session, notify);
	});

	it("leaves the transcript title alone while the card is still running", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "5"],
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
			status: "waiting",
		});

		applyStatusChange(session, "running", undefined, deps());

		expect(titleMock).not.toHaveBeenCalled();
	});
});
