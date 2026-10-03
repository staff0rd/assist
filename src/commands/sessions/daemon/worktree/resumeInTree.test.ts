import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import type { Session } from "../createSession";
import { resumeInReplacementTree } from "./resumeInReplacementTree";
import { type TreeSpawnContext } from "./spawnInTree";
import { resumeInTree } from "./resumeInTree";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./resumeInReplacementTree", () => ({
	resumeInReplacementTree: vi.fn(() => "9"),
}));
vi.mock("./detectExistingWorktree", () => ({
	detectExistingWorktree: () => ({ path: "/git/repo-2", clone: "/git/repo" }),
}));
vi.mock("../spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));

const existsMock = vi.mocked(existsSync);
const replacementMock = vi.mocked(resumeInReplacementTree);

function context(): { ctx: TreeSpawnContext; sessions: Map<string, Session> } {
	const sessions = new Map<string, Session>();
	return {
		sessions,
		ctx: {
			sessions,
			spawnWith: (create) => {
				const session = create("4");
				sessions.set(session.id, session);
				return session.id;
			},
			notify: vi.fn(),
			startHeld: vi.fn(),
		},
	};
}

describe("resumeInTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
	});

	it("resumes in place while the recorded tree is still on disk", () => {
		const { ctx, sessions } = context();

		const id = resumeInTree(ctx, "abc12345", "/git/repo-2", "work");

		expect(replacementMock).not.toHaveBeenCalled();
		expect(sessions.get(id)?.cwd).toBe("/git/repo-2");
		expect(sessions.get(id)?.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("hands a reaped tree to the replacement allocation", () => {
		existsMock.mockReturnValue(false);
		const { ctx, sessions } = context();

		expect(resumeInTree(ctx, "abc12345", "/git/repo-2", "work")).toBe("9");
		expect(replacementMock).toHaveBeenCalledWith(
			ctx,
			"abc12345",
			"/git/repo-2",
			"work",
			undefined,
		);
		expect(sessions.size).toBe(0);
	});
});
