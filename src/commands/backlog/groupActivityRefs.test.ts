import { describe, expect, it } from "vitest";
import { groupActivityRefs } from "./groupActivityRefs";
import type { GitRef } from "./types";

function commit(ref: string): GitRef {
	return { kind: "commit", ref };
}

describe("groupActivityRefs", () => {
	it("splits refs into branch, commit, and PR groups", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature" },
			commit("aaa"),
			{ kind: "pr", ref: "42" },
		];

		const grouped = groupActivityRefs(refs);

		expect(grouped.branches).toEqual([{ kind: "branch", ref: "feature" }]);
		expect(grouped.commits).toEqual([commit("aaa")]);
		expect(grouped.prs).toEqual([{ kind: "pr", ref: "42" }]);
		expect(grouped.hiddenCommits).toBe(0);
	});

	it("orders each group newest-first (reversing the oldest-first input)", () => {
		const refs: GitRef[] = [
			commit("oldest"),
			commit("middle"),
			commit("newest"),
		];

		const grouped = groupActivityRefs(refs);

		expect(grouped.commits.map((c) => c.ref)).toEqual([
			"newest",
			"middle",
			"oldest",
		]);
	});

	it("caps the commit list and reports the overflow count", () => {
		const refs = Array.from({ length: 13 }, (_, i) => commit(`c${i}`));

		const grouped = groupActivityRefs(refs, 10);

		expect(grouped.commits).toHaveLength(10);
		expect(grouped.hiddenCommits).toBe(3);
		expect(grouped.commits[0].ref).toBe("c12");
	});

	it("does not mutate the input array", () => {
		const refs: GitRef[] = [commit("a"), commit("b")];

		groupActivityRefs(refs);

		expect(refs.map((c) => c.ref)).toEqual(["a", "b"]);
	});
});
