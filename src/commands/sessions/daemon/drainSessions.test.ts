import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import { drainSessions } from "./drainSessions";
import { killPtyTree } from "./killPtyTree";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve({ removed: true })),
}));
vi.mock("./worktree/resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;

describe("drainSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes plain sessions outright", () => {
		const a = makeSession({ id: "1", pty: makePty().pty });
		const b = makeSession({ id: "2", pty: makePty().pty });
		const sessions = new Map([
			[a.id, a],
			[b.id, b],
		]);

		expect(drainSessions(sessions, vi.fn())).toBe(2);

		expect(sessions.size).toBe(0);
		expect(resolveMock).not.toHaveBeenCalled();
	});

	it("routes a worktree session through the durability gate instead of deleting its card", () => {
		const held = makeSession({
			id: "1",
			pty: makePty().pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[held.id, held]]);

		drainSessions(sessions, vi.fn());

		expect(sessions.get("1")).toBe(held);
		expect(held.closing).toBe(true);
		expect(held.pendingDismiss).toBeTypeOf("function");
	});

	it("group-kills the process tree of a worktree session rather than the pty leader alone", () => {
		const { pty } = makePty(42);
		const held = makeSession({
			id: "1",
			pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		drainSessions(new Map([[held.id, held]]), vi.fn());

		expect(killMock).toHaveBeenCalledWith(pty);
		expect(pty.kill).not.toHaveBeenCalled();
	});

	it("returns zero when there is nothing to drain", () => {
		expect(drainSessions(new Map(), vi.fn())).toBe(0);
	});
});
