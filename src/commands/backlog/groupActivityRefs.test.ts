import { describe, expect, it } from "vitest";
import { groupActivityRefs } from "./groupActivityRefs";
import type { GitRef } from "./types";

function commit(ref: string): GitRef {
	return { kind: "commit", ref };
}

describe("groupActivityRefs", () => {
	it("splits refs into branch, commit, PR, slack, and session groups", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature" },
			commit("aaa"),
			{ kind: "pr", ref: "42" },
			{ kind: "slack", ref: "https://slack/thread", title: "My PR" },
			{ kind: "session", ref: "sess-1", title: "Fix the thing" },
		];

		const grouped = groupActivityRefs(refs);

		expect(grouped.branches).toEqual([{ kind: "branch", ref: "feature" }]);
		expect(grouped.commits).toEqual([commit("aaa")]);
		expect(grouped.prs).toEqual([{ kind: "pr", ref: "42" }]);
		expect(grouped.slacks).toEqual([
			{ kind: "slack", ref: "https://slack/thread", title: "My PR" },
		]);
		expect(grouped.sessions).toEqual([
			{ kind: "session", ref: "sess-1", title: "Fix the thing" },
		]);
		expect(grouped.overflowCommits).toEqual([]);
	});

	it("groups docs unlock approvals apart from the other refs", () => {
		const unlock: GitRef = {
			kind: "docs-unlock",
			ref: "approved",
			title: "Docs pages and screenshots unlocked by PIN",
		};

		const grouped = groupActivityRefs([commit("aaa"), unlock]);

		expect(grouped.docsUnlocks).toEqual([unlock]);
		expect(grouped.commits).toEqual([commit("aaa")]);
	});

	it("orders sessions newest-first", () => {
		const refs: GitRef[] = [
			{ kind: "session", ref: "older" },
			{ kind: "session", ref: "newer" },
		];

		const grouped = groupActivityRefs(refs);

		expect(grouped.sessions.map((s) => s.ref)).toEqual(["newer", "older"]);
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

	it("caps the commit list and returns the overflow commits", () => {
		const refs = Array.from({ length: 13 }, (_, i) => commit(`c${i}`));

		const grouped = groupActivityRefs(refs, 10);

		expect(grouped.commits).toHaveLength(10);
		expect(grouped.commits[0].ref).toBe("c12");
		expect(grouped.overflowCommits.map((c) => c.ref)).toEqual([
			"c2",
			"c1",
			"c0",
		]);
	});

	it("returns every commit and no overflow when the limit is unbounded", () => {
		const refs = Array.from({ length: 13 }, (_, i) => commit(`c${i}`));

		const grouped = groupActivityRefs(refs, Number.POSITIVE_INFINITY);

		expect(grouped.commits).toHaveLength(13);
		expect(grouped.overflowCommits).toEqual([]);
	});

	it("does not mutate the input array", () => {
		const refs: GitRef[] = [commit("a"), commit("b")];

		groupActivityRefs(refs);

		expect(refs.map((c) => c.ref)).toEqual(["a", "b"]);
	});
});
