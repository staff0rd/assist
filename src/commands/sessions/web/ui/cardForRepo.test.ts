import { describe, expect, it } from "vitest";
import { cardForRepo } from "./cardForRepo";
import type { SessionInfo } from "./types";

const clone = "/repos/live";
const group = { origin: "host/org/live", clone };

function session(id: string, cwd: string, grouped = true): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd,
		...(grouped && { repoGroup: group }),
	};
}

const sessions = [
	session("worktree", "/repos/live/.worktrees/feature"),
	session("plain", "/repos/other", false),
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
