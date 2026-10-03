import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import { dismissSessionGated } from "./dismissSessionGated";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./dismissSession", () => ({ dismissSession: vi.fn(() => true) }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve({ removed: true })),
}));
vi.mock("./worktree/resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));
vi.mock("./worktree/worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, install: true, copy: [] })),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;
const dismissMock = dismissSession as unknown as ReturnType<typeof vi.fn>;

describe("dismissSessionGated", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		reapMock.mockResolvedValue({ removed: true });
	});

	it("dismisses a non-worktree session immediately", () => {
		const s = makeSession({ id: "3" });
		const sessions = new Map([[s.id, s]]);
		const notify = vi.fn();

		dismissSessionGated(sessions, s.id, notify);

		expect(dismissMock).toHaveBeenCalledWith(sessions, "3");
		expect(notify).toHaveBeenCalledOnce();
		expect(resolveMock).not.toHaveBeenCalled();
	});

	it("group-kills the process tree and defers durability until the pty exits", () => {
		const { pty } = makePty(42);
		const s = makeSession({
			pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn());

		expect(killMock).toHaveBeenCalledWith(pty);
		expect(resolveMock).not.toHaveBeenCalled();
		expect(s.pendingDismiss).toBeTypeOf("function");
	});

	it("resolves durability immediately when the worktree session has no live pty", () => {
		const s = makeSession({
			pty: null,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn());

		expect(killMock).not.toHaveBeenCalled();
		expect(resolveMock).toHaveBeenCalledOnce();
	});

	it("marks the card closing and broadcasts it so the teardown is visible", () => {
		const s = makeSession({
			pty: makePty(42).pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);
		const notify = vi.fn();

		dismissSessionGated(sessions, s.id, notify);

		expect(s.closing).toBe(true);
		expect(notify).toHaveBeenCalled();
	});

	it("force-reaps and removes the card on an explicit discard, bypassing the gate", async () => {
		const s = makeSession({
			id: "3",
			pty: null,
			status: "stopped",
			undurable: { reason: "uncommitted changes" },
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn(), true);
		await Promise.resolve();

		expect(resolveMock).not.toHaveBeenCalled();
		expect(reapMock).toHaveBeenCalledWith("/git/repo-2", true);
		expect(dismissMock).toHaveBeenCalledWith(sessions, "3");
	});

	it("keeps the card and surfaces the failure when a discard cannot delete the tree", async () => {
		reapMock.mockResolvedValue({
			removed: false,
			reason: "EBUSY: resource busy or locked",
		});
		const s = makeSession({
			pty: null,
			status: "stopped",
			undurable: { reason: "uncommitted changes", removesTree: true },
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);
		const notify = vi.fn();

		dismissSessionGated(sessions, s.id, notify, true);
		await Promise.resolve();

		expect(dismissMock).not.toHaveBeenCalled();
		expect(s.worktree).toEqual({ path: "/git/repo-2", clone: "/git/repo" });
		expect(s.closing).toBeUndefined();
		expect(s.status).toBe("stopped");
		expect(s.undurable).toEqual({
			reason: "discard failed: EBUSY: resource busy or locked",
			removesTree: true,
		});
		expect(notify).toHaveBeenCalled();
	});

	it("holds a live session in the clone's own tree instead of deleting its card", () => {
		const { pty } = makePty(42);
		const s = makeSession({ pty, status: "running", cwd: "/git/repo" });
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn());

		expect(dismissMock).not.toHaveBeenCalled();
		expect(killMock).toHaveBeenCalledWith(pty);
		expect(s.pendingDismiss).toBeTypeOf("function");
	});

	it("closes an added agent outright while another card still holds the tree", () => {
		const agent = makeSession({
			id: "3",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sibling = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([
			[agent.id, agent],
			[sibling.id, sibling],
		]);

		dismissSessionGated(sessions, agent.id, vi.fn());

		expect(dismissMock).toHaveBeenCalledWith(sessions, "3");
		expect(resolveMock).not.toHaveBeenCalled();
		expect(agent.closing).toBeUndefined();
	});
});
