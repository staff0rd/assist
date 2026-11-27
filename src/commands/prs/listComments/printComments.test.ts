import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrComment, ReviewComment } from "../types";
import { printComments } from "./printComments";

let output: string[] = [];
let log: ReturnType<typeof vi.spyOn>;

function lineComment(overrides: Partial<Extract<PrComment, { type: "line" }>>) {
	return {
		type: "line" as const,
		id: 1,
		threadId: "T1",
		user: "alice",
		path: "src/foo.ts",
		line: 12,
		body: "Please rename this.",
		diff_hunk: "@@ -1 +1 @@\n-old\n+new",
		html_url: "https://github.com/o/r/pull/1#discussion_r1",
		resolved: false,
		...overrides,
	};
}

function review(overrides: Partial<ReviewComment>): ReviewComment {
	return {
		type: "review",
		id: 9,
		user: "carol",
		state: "COMMENTED",
		body: "Looks fine.",
		html_url: "https://github.com/o/r/pull/1#pullrequestreview-9",
		handled: false,
		...overrides,
	};
}

function printed(): string {
	return output.join("\n");
}

beforeEach(() => {
	output = [];
	log = vi
		.spyOn(console, "log")
		.mockImplementation((message?: unknown) => output.push(String(message)));
	process.env.CLAUDECODE = "1";
});

afterEach(() => {
	log.mockRestore();
	delete process.env.CLAUDECODE;
});

describe("printComments", () => {
	describe("when running under Claude Code", () => {
		it("should print unresolved comment bodies in full", () => {
			printComments({
				comments: [lineComment({ body: "This leaks a handle." })],
				cachePath: "/cache.yaml",
			});

			expect(printed()).toContain("This leaks a handle.");
			expect(printed()).toContain("src/foo.ts:12");
			expect(printed()).toContain(
				"https://github.com/o/r/pull/1#discussion_r1",
			);
			expect(printed()).toContain("alice");
		});

		it("should print each comment's id so it can be passed to fixed/wontfix", () => {
			printComments({
				comments: [lineComment({ id: 4242 })],
				cachePath: null,
			});

			expect(printed()).toContain("id 4242");
		});

		it("should not colour the output", () => {
			printComments({ comments: [lineComment({})], cachePath: null });

			expect(printed()).not.toContain(String.fromCharCode(27));
		});

		it("should omit the diff hunk excerpt", () => {
			printComments({
				comments: [lineComment({ diff_hunk: "@@ -1 +1 @@\n-old\n+SENTINEL" })],
				cachePath: null,
			});

			expect(printed()).not.toContain("SENTINEL");
		});
	});

	describe("when grouping line comments", () => {
		it("should render one block per threadId", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1" }),
					lineComment({ id: 2, threadId: "T2", path: "src/bar.ts", line: 3 }),
				],
				cachePath: null,
			});

			expect(printed().match(/^Thread on /gm)).toHaveLength(2);
		});

		it("should render a multi-comment thread as a single block", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1", body: "First point." }),
					lineComment({
						id: 2,
						threadId: "T1",
						user: "bob",
						body: "Agreed, will fix.",
						html_url: "https://github.com/o/r/pull/1#discussion_r2",
					}),
				],
				cachePath: null,
			});

			expect(printed().match(/^Thread on /gm)).toHaveLength(1);
			expect(printed()).toContain("First point.");
			expect(printed()).toContain("Agreed, will fix.");
			expect(printed()).toContain("bob");
		});

		it("should keep unmapped comments in separate blocks", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "" }),
					lineComment({ id: 2, threadId: "" }),
				],
				cachePath: null,
			});

			expect(printed().match(/^Thread on /gm)).toHaveLength(2);
		});
	});

	describe("when there are review comments", () => {
		it("should print them in full ahead of the line-comment threads", () => {
			printComments({
				comments: [
					review({
						state: "CHANGES_REQUESTED",
						body: "Overall this needs work.",
					}),
					lineComment({}),
				],
				cachePath: null,
			});

			const text = printed();
			expect(text).toContain("Overall this needs work.");
			expect(text.indexOf("Review by carol")).toBeLessThan(
				text.indexOf("Thread on"),
			);
		});
	});

	describe("when a review has been handled", () => {
		it("should list it as a one-line index rather than its full body", () => {
			printComments({
				comments: [
					review({
						id: 77,
						handled: true,
						body: "Findings outside the diff\nSECOND_LINE detail.",
					}),
				],
				cachePath: null,
			});

			expect(printed()).toContain("Handled reviews (1)");
			expect(printed()).toContain("carol id 77: Findings outside the diff");
			expect(printed()).not.toContain("SECOND_LINE");
			expect(printed()).not.toContain("Review by carol");
		});

		it("should print the unhandled review's id and url so review-reply can target it", () => {
			printComments({ comments: [review({ id: 55 })], cachePath: null });

			expect(printed()).toContain("id 55");
			expect(printed()).toContain(
				"https://github.com/o/r/pull/1#pullrequestreview-9",
			);
		});
	});

	describe("when threads are resolved", () => {
		it("should render them as a one-line index rather than full bodies", () => {
			printComments({
				comments: [
					lineComment({
						id: 1,
						threadId: "T1",
						resolved: true,
						body: "Nit: rename.\nSecond paragraph of detail.",
					}),
				],
				cachePath: null,
			});

			expect(printed()).toContain("Resolved threads (1)");
			expect(printed()).toContain("Nit: rename.");
			expect(printed()).not.toContain("Second paragraph of detail.");
		});

		it("should not render them as full thread blocks", () => {
			printComments({
				comments: [lineComment({ resolved: true })],
				cachePath: null,
			});

			expect(printed()).not.toContain("Thread on");
		});

		it("should render one line per thread, not per comment", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1", resolved: true }),
					lineComment({ id: 2, threadId: "T1", resolved: true }),
					lineComment({
						id: 3,
						threadId: "T2",
						resolved: true,
						path: "src/bar.ts",
					}),
				],
				cachePath: null,
			});

			expect(printed()).toContain("Resolved threads (2)");
			expect(printed()).toContain("(2 comments)");
		});

		it("should keep unresolved threads in full alongside the resolved index", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1", body: "Still open." }),
					lineComment({
						id: 2,
						threadId: "T2",
						resolved: true,
						body: "Already done.",
					}),
				],
				cachePath: null,
			});

			const text = printed();
			expect(text).toContain("Unresolved threads (1)");
			expect(text).toContain("Still open.");
			expect(text.indexOf("Unresolved threads")).toBeLessThan(
				text.indexOf("Resolved threads"),
			);
		});
	});

	describe("the closing summary", () => {
		it("should report unresolved and resolved thread counts", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1" }),
					lineComment({ id: 2, threadId: "T2", resolved: true }),
					lineComment({ id: 3, threadId: "T3", resolved: true }),
				],
				cachePath: null,
			});

			expect(printed()).toContain("Found 1 unresolved and 2 resolved threads.");
		});

		it("should report the review comment count alongside", () => {
			printComments({
				comments: [
					review({}),
					review({ id: 10, handled: true }),
					lineComment({}),
				],
				cachePath: null,
			});

			expect(printed()).toContain(
				"Found 1 unhandled and 1 handled reviews, 1 unresolved and 0 resolved threads.",
			);
		});
	});

	describe("the closing footer under Claude Code", () => {
		it("should not point at the yaml cache", () => {
			printComments({ comments: [lineComment({})], cachePath: "/cache.yaml" });

			expect(printed()).not.toContain("Saved to /cache.yaml");
			expect(printed()).not.toContain("/cache.yaml");
		});

		it("should say the unresolved threads are printed above, so a tail sees it", () => {
			printComments({ comments: [lineComment({})], cachePath: "/cache.yaml" });

			const lastLines = output.slice(-2).join("\n");
			expect(lastLines).toContain("printed in full above");
			expect(lastLines).toContain("do not read or parse the YAML cache");
		});

		it("should still point at unhandled reviews when no thread is unresolved", () => {
			printComments({ comments: [review({})], cachePath: null });

			expect(printed()).toContain("printed in full above");
		});

		it("should say there is nothing to process when no thread is unresolved", () => {
			printComments({
				comments: [lineComment({ resolved: true })],
				cachePath: "/cache.yaml",
			});

			expect(printed()).toContain(
				"No unresolved threads or unhandled reviews to process.",
			);
			expect(printed()).not.toContain("printed in full above");
		});
	});

	describe("when there are no comments", () => {
		it("should say so", () => {
			printComments({ comments: [], cachePath: null });

			expect(printed()).toBe("No comments found.");
		});
	});

	describe("on the human path", () => {
		beforeEach(() => {
			delete process.env.CLAUDECODE;
		});

		it("should include the diff hunk excerpt", () => {
			printComments({
				comments: [lineComment({ diff_hunk: "@@ -1 +1 @@\n-old\n+SENTINEL" })],
				cachePath: null,
			});

			expect(printed()).toContain("SENTINEL");
		});

		it("should still report the cache path", () => {
			printComments({ comments: [lineComment({})], cachePath: "/cache.yaml" });

			expect(printed()).toContain("Saved to /cache.yaml");
		});

		it("should print the same grouped structure", () => {
			printComments({
				comments: [
					lineComment({ id: 1, threadId: "T1" }),
					lineComment({ id: 2, threadId: "T2", resolved: true }),
				],
				cachePath: null,
			});

			expect(printed()).toContain("Thread on");
			expect(printed()).toContain("Resolved threads (1)");
			expect(printed()).toContain("Found 1 unresolved and 1 resolved thread");
		});
	});
});
