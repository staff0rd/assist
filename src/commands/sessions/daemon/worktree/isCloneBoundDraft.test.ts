import { describe, expect, it } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { isCloneBoundDraft } from "./isCloneBoundDraft";

const draft = {
	commandType: "assist",
	assistArgs: ["draft", "--once"],
	status: "running",
	cwd: "/git/repo",
} satisfies Partial<Session>;

describe("isCloneBoundDraft", () => {
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
});
