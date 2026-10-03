import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { cardForRepo } from "./cardForRepo";

const clone = "/repos/live";
const group = { origin: "host/org/live", clone };

const sessions = [
	makeSessionInfo({
		id: "worktree",
		cwd: "/repos/live/.worktrees/feature",
		repoGroup: group,
	}),
	makeSessionInfo({ id: "plain", cwd: "/repos/other" }),
];

describe("cardForRepo", () => {
	it("resolves the repo's remembered card", () => {
		expect(cardForRepo({ [clone]: "worktree" }, clone, sessions)).toBe(
			"worktree",
		);
	});

	it("returns null when the repo has no entry", () => {
		expect(
			cardForRepo({ "/repos/other": "plain" }, clone, sessions),
		).toBeNull();
	});

	it("returns null when the remembered session is gone", () => {
		expect(cardForRepo({ [clone]: "reaped" }, clone, sessions)).toBeNull();
	});

	it("returns null when the remembered session now runs in another repo", () => {
		expect(cardForRepo({ [clone]: "plain" }, clone, sessions)).toBeNull();
	});

	it("returns null when no repo is selected", () => {
		expect(cardForRepo({ [clone]: "worktree" }, "", sessions)).toBeNull();
	});
});
