import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import type { Session } from "../createSession";
import { allocateTree } from "./allocateTree";
import { carryTranscriptToTree } from "./carryTranscriptToTree";
import { worktreeAttributionIncludingReaped } from "./readWorktreeRegistry";
import { resumeInReplacementTree } from "./resumeInReplacementTree";
import type { TreeSpawnContext } from "./spawnInTree";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./carryTranscriptToTree", () => ({
	carryTranscriptToTree: vi.fn(),
}));
vi.mock("./readWorktreeRegistry", () => ({
	worktreeAttributionIncludingReaped: vi.fn(),
}));
vi.mock("./allocateTree", () => ({ allocateTree: vi.fn() }));
vi.mock("./bindNewWorktree", () => ({ bindNewWorktree: vi.fn() }));
vi.mock("./boundTreeRoots", () => ({ boundTreeRoots: () => new Set() }));
vi.mock("../spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));

const existsMock = vi.mocked(existsSync);
const attributionMock = vi.mocked(worktreeAttributionIncludingReaped);
const allocateMock = vi.mocked(allocateTree);
const carryMock = vi.mocked(carryTranscriptToTree);

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

describe("resumeInReplacementTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		attributionMock.mockReturnValue({
			clone: "/git/repo",
			origin: "github.com/acme/repo",
		});
		allocateMock.mockReturnValue({
			cwd: "/git/repo-3",
			kind: "worktree",
			created: true,
			clone: "/git/repo",
		});
	});

	it("allocates from the recorded clone and resumes there", () => {
		const { ctx, sessions } = context();

		const id = resumeInReplacementTree(ctx, "abc12345", "/git/repo-7", "work");

		expect(allocateMock).toHaveBeenCalledWith("/git/repo", new Set(), {
			replacesTree: "/git/repo-7",
		});
		expect(sessions.get(id)?.cwd).toBe("/git/repo-3");
		expect(sessions.get(id)?.claudeSessionId).toBe("abc12345");
	});

	it("carries the transcript into the tree it resumes in", () => {
		const { ctx } = context();

		resumeInReplacementTree(ctx, "abc12345", "/git/repo-7", undefined);

		expect(carryMock).toHaveBeenCalledWith(
			"abc12345",
			"/git/repo-7",
			"/git/repo-3",
		);
	});

	it("holds the resumed session until the new worktree is seeded", () => {
		const { ctx, sessions } = context();

		const id = resumeInReplacementTree(
			ctx,
			"abc12345",
			"/git/repo-7",
			undefined,
		);

		expect(sessions.get(id)?.pty).toBeNull();
		expect(sessions.get(id)?.pendingStart).toBeTypeOf("function");
	});

	it("starts straight away when an existing tree was reused", () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo",
			kind: "primary",
			created: false,
			clone: "/git/repo",
		});
		const { ctx, sessions } = context();

		const id = resumeInReplacementTree(
			ctx,
			"abc12345",
			"/git/repo-7",
			undefined,
		);

		expect(sessions.get(id)?.pendingStart).toBeUndefined();
	});

	it("refuses without creating a card when no clone is recorded", () => {
		attributionMock.mockReturnValue(undefined);
		const { ctx, sessions } = context();

		expect(() =>
			resumeInReplacementTree(ctx, "abc12345", "/git/repo-7", undefined),
		).toThrow("/git/repo-7");
		expect(sessions.size).toBe(0);
	});

	it("refuses when the recorded clone is itself gone", () => {
		existsMock.mockReturnValue(false);
		const { ctx, sessions } = context();

		expect(() =>
			resumeInReplacementTree(ctx, "abc12345", "/git/repo-7", undefined),
		).toThrow("/git/repo-7");
		expect(sessions.size).toBe(0);
	});
});
