import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { isCloneBoundDraft } from "./isCloneBoundDraft";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, includeDrafts: false })),
}));

const configMock = vi.mocked(worktreeConfigFor);

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "assist draft",
		commandType: "assist",
		assistArgs: ["draft", "--once"],
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: null,
		scrollback: "",
		cwd: "/git/repo",
		...overrides,
	} as Session;
}

describe("isCloneBoundDraft", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({
			enabled: true,
			includeDrafts: false,
		} as ReturnType<typeof worktreeConfigFor>);
	});

	it("recognises a draft kept in the clone", () => {
		expect(isCloneBoundDraft(session())).toBe(true);
	});

	it("recognises bug and refine too", () => {
		expect(isCloneBoundDraft(session({ assistArgs: ["bug"] }))).toBe(true);
		expect(isCloneBoundDraft(session({ assistArgs: ["refine", "7"] }))).toBe(
			true,
		);
	});

	it("excludes a run the draft chained into", () => {
		expect(
			isCloneBoundDraft(session({ assistArgs: ["backlog", "run", "7"] })),
		).toBe(false);
	});

	it("excludes a draft that was given its own workspace", () => {
		expect(
			isCloneBoundDraft(
				session({
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

		expect(isCloneBoundDraft(session())).toBe(false);
	});

	it("recognises a draft on a repo with parallel work off", () => {
		configMock.mockReturnValue({
			enabled: false,
			includeDrafts: true,
		} as ReturnType<typeof worktreeConfigFor>);

		expect(isCloneBoundDraft(session())).toBe(true);
	});
});
