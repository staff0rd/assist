import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { isCloneBoundDraft } from "./isCloneBoundDraft";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, includeDrafts: false })),
}));

const configMock = vi.mocked(worktreeConfigFor);

const draft = {
	commandType: "assist",
	assistArgs: ["draft", "--once"],
	status: "running",
	cwd: "/git/repo",
} satisfies Partial<Session>;

describe("isCloneBoundDraft", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({
			enabled: true,
			includeDrafts: false,
		} as ReturnType<typeof worktreeConfigFor>);
	});

	it("recognises a draft kept in the clone", () => {
		expect(isCloneBoundDraft(makeSession(draft))).toBe(true);
	});

	it("recognises bug and refine too", () => {
		expect(
			isCloneBoundDraft(makeSession({ ...draft, assistArgs: ["bug"] })),
		).toBe(true);
		expect(
			isCloneBoundDraft(makeSession({ ...draft, assistArgs: ["refine", "7"] })),
		).toBe(true);
	});

	it("excludes a run the draft chained into", () => {
		expect(
			isCloneBoundDraft(
				makeSession({ ...draft, assistArgs: ["backlog", "run", "7"] }),
			),
		).toBe(false);
	});

	it("excludes a draft that was given its own workspace", () => {
		expect(
			isCloneBoundDraft(
				makeSession({
					...draft,
					cwd: "/git/repo-2",
					worktree: { path: "/git/repo-2", clone: "/git/repo" },
				}),
			),
		).toBe(false);
	});

	it("excludes a draft on a repo that opted drafts into workspaces", () => {
		configMock.mockReturnValue({
			enabled: true,
			includeDrafts: true,
		} as ReturnType<typeof worktreeConfigFor>);

		expect(isCloneBoundDraft(makeSession(draft))).toBe(false);
	});

	it("recognises a draft on a repo with parallel work off", () => {
		configMock.mockReturnValue({
			enabled: false,
			includeDrafts: true,
		} as ReturnType<typeof worktreeConfigFor>);

		expect(isCloneBoundDraft(makeSession(draft))).toBe(true);
	});
});
