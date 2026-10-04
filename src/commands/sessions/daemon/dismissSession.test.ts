import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve({ removed: true })),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;

describe("dismissSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("group-kills the process tree rather than the pty leader alone", () => {
		const { pty } = makePty(7);
		const s = makeSession({ status: "running", pty });

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(killMock).toHaveBeenCalledWith(pty);
	});

	it("reaps the worktree of the last card holding it", () => {
		const s = makeSession({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(reapMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("never reaps a worktree another card is still working in", () => {
		const agent = makeSession({
			id: "1",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sibling = makeSession({
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
