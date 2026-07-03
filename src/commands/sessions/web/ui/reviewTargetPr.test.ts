import { describe, expect, it } from "vitest";
import { reviewTargetPr } from "./reviewTargetPr";
import type { SessionInfo } from "./types";

function makeSession(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "fallback",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("reviewTargetPr", () => {
	it("reads the PR number from the subtitle for a card review launch", () => {
		const session = makeSession({
			assistArgs: ["review"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("reads the PR number from assistArgs for a top-nav review launch", () => {
		const session = makeSession({
			assistArgs: ["review", "119"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("ignores flags when reading the number from assistArgs", () => {
		const session = makeSession({
			assistArgs: ["review", "--force"],
			subtitle: "#119 · alice · 2h ago",
		});
		expect(reviewTargetPr(session)).toBe(119);
	});

	it("handles review-comments sessions", () => {
		const session = makeSession({
			assistArgs: ["review-comments", "122"],
		});
		expect(reviewTargetPr(session)).toBe(122);
	});

	it("returns undefined for non-review sessions", () => {
		expect(
			reviewTargetPr(makeSession({ assistArgs: ["next"], subtitle: "#5" })),
		).toBeUndefined();
		expect(
			reviewTargetPr(
				makeSession({ commandType: "claude", assistArgs: undefined }),
			),
		).toBeUndefined();
	});

	it("returns undefined when a review session carries no PR number", () => {
		expect(
			reviewTargetPr(makeSession({ assistArgs: ["review"] })),
		).toBeUndefined();
	});
});
