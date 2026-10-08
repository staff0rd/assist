import { describe, expect, it } from "vitest";
import { cloneBadgeSessionIds } from "./cloneBadgeSessionIds";

const origin = "git@github.com:me/assist.git";
const clone = "/home/me/assist";

function session(id: string, cwd?: string, grouped = true) {
	return { id, cwd, repoGroup: grouped ? { origin, clone } : undefined };
}

describe("cloneBadgeSessionIds", () => {
	it("badges the clone session when a worktree sibling is present", () => {
		const ids = cloneBadgeSessionIds([
			session("a", clone),
			session("b", "/home/me/assist-3"),
		]);

		expect([...ids]).toEqual(["a"]);
	});

	it("badges every clone session when worktree siblings are present", () => {
		const ids = cloneBadgeSessionIds([
			session("a", clone),
			session("b", clone),
			session("c", "/home/me/assist-3"),
		]);

		expect([...ids]).toEqual(["a", "b"]);
	});

	it("badges every session when all sessions for the repo are in the clone", () => {
		const ids = cloneBadgeSessionIds([
			session("a", clone),
			session("b", clone),
		]);

		expect([...ids]).toEqual(["a", "b"]);
	});

	it("badges a lone clone session", () => {
		expect([...cloneBadgeSessionIds([session("a", clone)])]).toEqual(["a"]);
	});

	it("badges nothing when only worktree sessions are visible", () => {
		const ids = cloneBadgeSessionIds([
			session("a", "/home/me/assist-3"),
			session("b", "/home/me/assist-4"),
		]);

		expect([...ids]).toEqual([]);
	});

	it("keeps repos separate", () => {
		const other = {
			origin: "git@github.com:me/other.git",
			clone: "/home/me/other",
		};
		const ids = cloneBadgeSessionIds([
			session("a", clone),
			session("b", "/home/me/assist-3"),
			{ id: "c", cwd: other.clone, repoGroup: other },
		]);

		expect([...ids]).toEqual(["a", "c"]);
	});

	it("ignores sessions with no repo group", () => {
		const ids = cloneBadgeSessionIds([
			session("a", clone, false),
			session("b", "/home/me/assist-3", false),
		]);

		expect([...ids]).toEqual([]);
	});
});
