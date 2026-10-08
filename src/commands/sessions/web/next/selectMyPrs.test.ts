import { describe, expect, it } from "vitest";
import { selectMyPrs } from "./selectMyPrs";
import type { GhPeerPrNode } from "./types";

function pr(
	number: number,
	author: string,
	overrides: Partial<GhPeerPrNode> = {},
): GhPeerPrNode {
	return {
		number,
		title: `PR ${number}`,
		url: `https://github.com/o/r/pull/${number}`,
		createdAt: `2026-09-${String(number).padStart(2, "0")}T00:00:00Z`,
		isDraft: false,
		author: { login: author },
		...overrides,
	};
}

describe("selectMyPrs", () => {
	it("includes my PRs, drafts and do-not-merge included, case-insensitively", () => {
		const result = selectMyPrs(
			[
				pr(1, "Me"),
				pr(2, "me", { isDraft: true }),
				pr(3, "me", { title: "[DNM] spike" }),
			],
			"me",
		);
		expect(result.map((p) => [p.number, p.isDraft])).toEqual([
			[1, false],
			[2, true],
			[3, false],
		]);
	});

	it("excludes PRs authored by others", () => {
		expect(
			selectMyPrs(
				[pr(1, "alice"), pr(2, "bob"), { ...pr(3, "x"), author: null }],
				"me",
			),
		).toEqual([]);
	});

	it("orders by creation and reports opened-at, not review requests", () => {
		const result = selectMyPrs([pr(9, "me"), pr(4, "me")], "me");
		expect(result.map((p) => [p.number, p.requestedAt, p.reason])).toEqual([
			[4, "2026-09-04T00:00:00Z", "peer"],
			[9, "2026-09-09T00:00:00Z", "peer"],
		]);
	});
});
