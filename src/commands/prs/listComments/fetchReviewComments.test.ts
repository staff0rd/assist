import { mkdtempSync, rmSync } from "node:fs";
import type * as osModule from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markReviewHandledLocally } from "../markReviewHandledLocally";
import { reviewHandledMarker } from "../reviewHandledMarker";
import type { ReviewComment } from "../types";
import { fetchReviewComments } from "./fetchReviewComments";
import { printComments } from "./printComments";

const env = vi.hoisted(() => ({
	home: "",
	responses: new Map<string, unknown[]>(),
}));

vi.mock("node:os", async () => {
	const actual = await vi.importActual<typeof osModule>("node:os");
	return { ...actual, homedir: () => env.home };
});

vi.mock("./fetchJson", () => ({
	fetchJson: (endpoint: string) => env.responses.get(endpoint) ?? [],
}));

function apiReview(id: number) {
	return {
		id,
		user: { login: "bot" },
		state: "COMMENTED",
		body: `Review ${id} summary`,
		html_url: `https://github.com/o/r/pull/1#pullrequestreview-${id}`,
	};
}

function handledIds(): number[] {
	return (fetchReviewComments("o", "r", 1) as ReviewComment[])
		.filter((r) => r.handled)
		.map((r) => r.id)
		.sort((a, b) => a - b);
}

beforeEach(() => {
	env.home = mkdtempSync(join(tmpdir(), "assist-review-ack-"));
	env.responses = new Map([
		[
			"repos/o/r/pulls/1/reviews",
			[apiReview(10), apiReview(20), apiReview(30)],
		],
		["repos/o/r/issues/1/comments", [{ body: reviewHandledMarker(10) }]],
	]);
});

afterEach(() => {
	rmSync(env.home, { recursive: true, force: true });
});

describe("fetchReviewComments handled reviews", () => {
	it("treats only reviews with a posted marker as handled when none are marked locally", () => {
		expect(handledIds()).toEqual([10]);
	});

	it("merges reviews marked handled locally with posted markers", () => {
		markReviewHandledLocally("o", "r", 1, 30);
		expect(handledIds()).toEqual([10, 30]);
	});

	it("keeps a local mark scoped to its own pull request", () => {
		markReviewHandledLocally("o", "r", 2, 20);
		expect(handledIds()).toEqual([10]);
	});

	it("keeps earlier local marks when another review is marked", () => {
		markReviewHandledLocally("o", "r", 1, 20);
		markReviewHandledLocally("o", "r", 1, 30);
		expect(handledIds()).toEqual([10, 20, 30]);
	});

	it("lists a locally marked review under handled reviews, not unhandled", () => {
		markReviewHandledLocally("o", "r", 1, 30);
		const output: string[] = [];
		const log = vi
			.spyOn(console, "log")
			.mockImplementation((message?: unknown) => output.push(String(message)));
		try {
			printComments({
				comments: fetchReviewComments("o", "r", 1),
				cachePath: null,
			});
		} finally {
			log.mockRestore();
		}
		const printed = output.join("\n");
		const handledSection = printed.slice(printed.indexOf("Handled reviews"));
		expect(handledSection).toContain("id 30");
		expect(printed.slice(0, printed.indexOf("Handled reviews"))).not.toContain(
			"Review 30 summary",
		);
	});
});
