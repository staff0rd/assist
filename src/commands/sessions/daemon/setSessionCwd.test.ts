import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { setSessionCwd } from "./setSessionCwd";
import { detectExistingWorktree } from "./worktree/detectExistingWorktree";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./worktree/detectExistingWorktree", () => ({
	detectExistingWorktree: vi.fn(),
}));

const detectMock = vi.mocked(detectExistingWorktree);

function sessionsWith(session: Partial<Session>): Map<string, Session> {
	return new Map([["17", { id: "17", ...session } as Session]]);
}

beforeEach(() => {
	vi.clearAllMocks();
	detectMock.mockReturnValue(undefined);
});

describe("setSessionCwd", () => {
	it("moves the session and binds the worktree it moved into", () => {
		const worktree = { path: "/git/repo-2", clone: "/git/repo" };
		detectMock.mockReturnValue(worktree);
		const sessions = sessionsWith({ cwd: "/git/repo" });

		expect(setSessionCwd(sessions, "17", "/git/repo-2")).toBe(true);

		expect(sessions.get("17")).toMatchObject({ cwd: "/git/repo-2", worktree });
	});

	it("drops a worktree binding when moving into the clone", () => {
		const sessions = sessionsWith({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		setSessionCwd(sessions, "17", "/git/repo");

		expect(sessions.get("17")?.worktree).toBeUndefined();
	});

	it("ignores an unknown session or an unchanged cwd", () => {
		const sessions = sessionsWith({ cwd: "/git/repo" });

		expect(setSessionCwd(sessions, "99", "/git/repo-2")).toBe(false);
		expect(setSessionCwd(sessions, "17", "/git/repo")).toBe(false);
	});
});
