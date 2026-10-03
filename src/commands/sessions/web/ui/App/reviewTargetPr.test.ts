import { describe, expect, it } from "vitest";
import { reviewTargetPr } from "./reviewTargetPr";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

describe("reviewTargetPr", () => {
	it("reads the PR number from the subtitle for a card review launch", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["review"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("reads the PR number from assistArgs for a top-nav review launch", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["review", "119"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("ignores flags when reading the number from assistArgs", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["review", "--force"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("handles review-pr-comments sessions", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["review-pr-comments", "122"],
		});
		expect(reviewTargetPr(session)).toBe(122);
	});

	it("handles fix-conflict sessions", () => {
		expect(
			reviewTargetPr(
				makeSessionInfo({
					commandType: "assist",
					assistArgs: ["fix-conflict", "122"],
				}),
			),
		).toBe(122);
		expect(
			reviewTargetPr(
				makeSessionInfo({
					commandType: "assist",
					assistArgs: ["fix-conflict", "--rebase", "122"],
				}),
			),
		).toBe(122);
	});

	it("returns undefined for non-review sessions", () => {
		expect(
			reviewTargetPr(
				makeSessionInfo({
					commandType: "assist",
					assistArgs: ["next"],
					subtitle: "#5",
				}),
			),
		).toBeUndefined();
		expect(
			reviewTargetPr(makeSessionInfo({ commandType: "claude" })),
		).toBeUndefined();
	});

	it("returns undefined when a review session carries no PR number", () => {
		expect(
			reviewTargetPr(
				makeSessionInfo({ commandType: "assist", assistArgs: ["review"] }),
			),
		).toBeUndefined();
	});
});
