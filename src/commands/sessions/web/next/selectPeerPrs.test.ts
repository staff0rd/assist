import { describe, expect, it } from "vitest";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode } from "./types";

function pr(
	number: number,
	overrides: Partial<GhPeerPrNode> & {
		requested?: string[];
		requestEvents?: { login: string; at: string }[];
		myReview?: { state: string; oid: string };
		head?: string;
		rollup?: string;
	} = {},
): GhPeerPrNode {
	const { requested, requestEvents, myReview, head, rollup, ...rest } =
		overrides;
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
			nodes: myReview
				? [
						{
							author: { login: "me" },
							state: myReview.state,
							commit: { oid: myReview.oid },
						},
					]
				: [],
		},
		commits: {
			nodes: [
				{
					commit: {
						oid: head ?? "head",
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

	it("excludes peer PRs I approved at the current head", () => {
		expect(
			numbers([pr(1, { myReview: { state: "APPROVED", oid: "head" } })]),
		).toEqual([]);
	});

	it("keeps peer PRs with commits newer than my approval", () => {
		expect(
			numbers([pr(1, { myReview: { state: "APPROVED", oid: "older" } })]),
		).toEqual([1]);
	});

	it("keeps peer PRs where my latest review was not an approval", () => {
		expect(
			numbers([
				pr(1, { myReview: { state: "CHANGES_REQUESTED", oid: "head" } }),
			]),
		).toEqual([1]);
	});

	it("keeps approved PRs that re-request my review", () => {
		expect(
			numbers([
				pr(1, {
					requested: ["me"],
					myReview: { state: "APPROVED", oid: "head" },
				}),
			]),
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
});
