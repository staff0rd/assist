import { describe, expect, it } from "vitest";
import { buildRepoChips } from "./buildRepoChips";

describe("buildRepoChips", () => {
	it("groups clones and worktrees of one origin under one chip labelled by folder", () => {
		const chips = buildRepoChips(
			[
				{
					cwd: "/git/assist",
					repoGroup: { origin: "/git/assist", clone: "/git/assist" },
				},
				{
					cwd: "/git/assist-5",
					repoGroup: { origin: "/git/assist", clone: "/git/assist-5" },
				},
				{ cwd: "/git/other" },
			],
			null,
		);

		expect(chips).toEqual([
			{ key: "/git/assist", label: "assist", count: 2, attention: false },
			{ key: "/git/other", label: "other", count: 1, attention: false },
		]);
	});

	it("orders by count then name and skips items without a repo", () => {
		const chips = buildRepoChips(
			[{ cwd: "/b" }, { cwd: "/c" }, { cwd: "/c" }, { cwd: "/a" }, {}],
			null,
		);

		expect(chips.map((c) => c.label)).toEqual(["c", "a", "b"]);
	});

	it("flags chips whose repo has an item needing attention", () => {
		const chips = buildRepoChips(
			[
				{ cwd: "/a", id: "ok" },
				{ cwd: "/a", id: "ask" },
				{ cwd: "/b", id: "ok" },
			],
			null,
			(item) => item.id === "ask",
		);

		expect(chips.map((c) => [c.label, c.attention])).toEqual([
			["a", true],
			["b", false],
		]);
	});

	it("keeps the selected repo with a zero count when it has no items", () => {
		const chips = buildRepoChips([{ cwd: "/a" }], "/gone");

		expect(chips).toEqual([
			{ key: "/a", label: "a", count: 1, attention: false },
			{ key: "/gone", label: "gone", count: 0, attention: false },
		]);
	});
});
