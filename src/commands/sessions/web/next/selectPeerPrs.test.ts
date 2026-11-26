import { describe, expect, it } from "vitest";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode } from "./types";

function pr(
	number: number,
	overrides: Partial<GhPeerPrNode> & {
		requested?: string[];
		requestEvents?: { login: string; at: string }[];
		myReview?: string;
		rollup?: string;
	} = {},
): GhPeerPrNode {
	const { requested, requestEvents, myReview, rollup, ...rest } = overrides;
	return {
		number,
		title: `PR ${number}`,
		url: `https://github.com/o/r/pull/${number}`,
		createdAt: `2026-09-${String(number).padStart(2, "0")}T00:00:00Z`,
		isDraft: false,
		author: { login: "alice" },
		reviewRequests: {
			nodes: (requested ?? []).map((login) => ({
				requestedReviewer: { login },
			})),
		},
		latestReviews: {
			nodes: myReview ? [{ author: { login: "me" }, state: myReview }] : [],
		},
		commits: {
			nodes: [
				{
					commit: {
						statusCheckRollup: rollup ? { state: rollup } : null,
					},
				},
			],
		},
		timelineItems: {
			nodes: (requestEvents ?? []).map(({ login, at }) => ({
				createdAt: at,
				requestedReviewer: { login },
			})),
		},
		...rest,
	};
}

const numbers = (nodes: GhPeerPrNode[], peers = ["alice"]) =>
	selectPeerPrs(nodes, "me", peers).map((p) => p.number);

describe("selectPeerPrs", () => {
	it("includes PRs authored by a peer, case-insensitively", () => {
		expect(numbers([pr(1)], ["Alice"])).toEqual([1]);
	});

	it("excludes PRs by non-peers that do not request my review", () => {
		expect(numbers([pr(1, { author: { login: "carol" } })])).toEqual([]);
	});

	it("includes non-peer PRs that request my review", () => {
		expect(
			numbers([pr(1, { author: { login: "carol" }, requested: ["me"] })]),
		).toEqual([1]);
	});

	it("excludes drafts and my own PRs", () => {
		expect(
			numbers([
				pr(1, { isDraft: true }),
				pr(2, { author: { login: "me" }, requested: ["me"] }),
			]),
		).toEqual([]);
	});

	it("excludes do-not-merge PRs even when they request my review", () => {
		expect(
			numbers([
				pr(1, { title: "[DNM] spike" }),
				pr(2, { title: "[Do Not Merge] wip", requested: ["me"] }),
			]),
		).toEqual([]);
	});

	it("excludes peer PRs with my standing approval, even after new commits", () => {
		expect(numbers([pr(1, { myReview: "APPROVED" })])).toEqual([]);
	});

	it("excludes peer PRs approved by another reviewer", () => {
		expect(
			numbers([
				pr(1, {
					latestReviews: {
						nodes: [{ author: { login: "bob" }, state: "APPROVED" }],
					},
				}),
			]),
		).toEqual([]);
	});

	it("keeps requested PRs approved by another reviewer", () => {
		expect(
			numbers([
				pr(1, {
					requested: ["me"],
					latestReviews: {
						nodes: [{ author: { login: "bob" }, state: "APPROVED" }],
					},
				}),
			]),
		).toEqual([1]);
	});

	it("keeps peer PRs where my latest review was not an approval", () => {
		expect(
			numbers([
				pr(1, { myReview: "DISMISSED" }),
				pr(2, { myReview: "COMMENTED" }),
			]),
		).toEqual([1, 2]);
	});

	it("excludes peer PRs where I requested changes and am not re-requested", () => {
		expect(numbers([pr(1, { myReview: "CHANGES_REQUESTED" })])).toEqual([]);
	});

	it("keeps peer PRs where another reviewer requested changes", () => {
		expect(
			numbers([
				pr(1, {
					latestReviews: {
						nodes: [{ author: { login: "bob" }, state: "CHANGES_REQUESTED" }],
					},
				}),
			]),
		).toEqual([1]);
	});

	it("returns changes-requested PRs as requested once my review is re-requested", () => {
		const result = selectPeerPrs(
			[pr(1, { requested: ["Me"], myReview: "CHANGES_REQUESTED" })],
			"me",
			["alice"],
		);
		expect(result.map((p) => [p.number, p.reason])).toEqual([[1, "requested"]]);
	});

	it("keeps approved PRs that re-request my review", () => {
		expect(
			numbers([pr(1, { requested: ["me"], myReview: "APPROVED" })]),
		).toEqual([1]);
	});

	it("orders by my latest review request, falling back to creation", () => {
		const result = selectPeerPrs(
			[
				pr(1, {
					requested: ["me"],
					requestEvents: [
						{ login: "me", at: "2026-09-01T00:00:00Z" },
						{ login: "bob", at: "2026-09-02T00:00:00Z" },
						{ login: "me", at: "2026-09-20T00:00:00Z" },
					],
				}),
				pr(10),
				pr(3, {
					author: { login: "carol" },
					requested: ["me"],
					requestEvents: [{ login: "me", at: "2026-09-05T00:00:00Z" }],
				}),
			],
			"me",
			["alice"],
		);
		expect(result.map((p) => [p.number, p.requestedAt, p.reason])).toEqual([
			[3, "2026-09-05T00:00:00Z", "requested"],
			[10, "2026-09-10T00:00:00Z", "peer"],
			[1, "2026-09-20T00:00:00Z", "requested"],
		]);
	});

	it("maps the head commit's check rollup", () => {
		const result = selectPeerPrs(
			[
				pr(1, { rollup: "SUCCESS" }),
				pr(2, { rollup: "ERROR" }),
				pr(3, { rollup: "EXPECTED" }),
				pr(4),
			],
			"me",
			["alice"],
		);
		expect(result.map((p) => p.checks)).toEqual([
			"success",
			"failure",
			"pending",
			null,
		]);
	});

	describe("repo approval rules", () => {
		const approvedBy = (...logins: string[]) => ({
			latestReviews: {
				nodes: logins.map((login) => ({
					author: { login },
					state: "APPROVED",
				})),
			},
		});
		const ruled = (
			nodes: GhPeerPrNode[],
			rules: Record<string, { hideReviewAfterApprovals?: number }>,
		) =>
			selectPeerPrs(nodes, "me", ["alice"], rules, () => "o/r").map(
				(p) => p.number,
			);

		it("keeps requested PRs below the bar and hides them at it", () => {
			expect(
				ruled(
					[
						pr(1, { requested: ["me"], ...approvedBy("bob") }),
						pr(2, { requested: ["me"], ...approvedBy("bob", "carol") }),
					],
					{ "o/r": { hideReviewAfterApprovals: 2 } },
				),
			).toEqual([1]);
		});

		it("hides requested PRs from non-peers once the bar is met", () => {
			const carol = { author: { login: "carol" }, requested: ["me"] };
			expect(
				ruled([pr(1, carol), pr(2, { ...carol, ...approvedBy("bob") })], {
					"o/r": { hideReviewAfterApprovals: 1 },
				}),
			).toEqual([1]);
		});

		it("hides peer PRs requesting my review once the bar is met", () => {
			expect(
				ruled([pr(1, { requested: ["me"], ...approvedBy("bob") })], {
					"o/r": { hideReviewAfterApprovals: 1 },
				}),
			).toEqual([]);
		});

		it("does not count my own approval or dismissed approvals", () => {
			expect(
				ruled(
					[
						pr(1, { requested: ["me"], ...approvedBy("Me") }),
						pr(2, {
							requested: ["me"],
							latestReviews: {
								nodes: [{ author: { login: "bob" }, state: "DISMISSED" }],
							},
						}),
					],
					{ "o/r": { hideReviewAfterApprovals: 1 } },
				),
			).toEqual([1, 2]);
		});

		it("applies a bare owner rule to all its repos", () => {
			expect(
				ruled([pr(1, { requested: ["me"], ...approvedBy("bob") })], {
					O: { hideReviewAfterApprovals: 1 },
				}),
			).toEqual([]);
		});

		it("prefers an exact repo rule over its owner rule", () => {
			expect(
				ruled([pr(1, { requested: ["me"], ...approvedBy("bob") })], {
					o: { hideReviewAfterApprovals: 1 },
					"o/r": { hideReviewAfterApprovals: 2 },
				}),
			).toEqual([1]);
		});

		it("leaves repos without a matching rule unchanged", () => {
			expect(
				ruled([pr(1, { requested: ["me"], ...approvedBy("bob") })], {
					"o/other": { hideReviewAfterApprovals: 1 },
					x: { hideReviewAfterApprovals: 1 },
				}),
			).toEqual([1]);
		});
	});
});
