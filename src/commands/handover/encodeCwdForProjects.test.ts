import { describe, expect, it } from "vitest";
import { encodeCwdForProjects } from "./encodeCwdForProjects";

describe("encodeCwdForProjects", () => {
	it("replaces forward slashes with dashes", () => {
		expect(encodeCwdForProjects("/home/me/git/foo")).toBe("-home-me-git-foo");
	});

	it("replaces dots with dashes (e.g. .claude)", () => {
		expect(encodeCwdForProjects("/home/me/git/foo/.claude/worktrees/bar")).toBe(
			"-home-me-git-foo--claude-worktrees-bar",
		);
	});

	it("replaces backslashes for Windows paths", () => {
		expect(encodeCwdForProjects("C:\\Users\\me\\git\\foo")).toBe(
			"C:-Users-me-git-foo",
		);
	});
});
