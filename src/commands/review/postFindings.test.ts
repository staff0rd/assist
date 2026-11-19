import { beforeEach, describe, expect, it, vi } from "vitest";
import type { comment as realCommentFn } from "../prs/comment";
import type { LineBoundFinding } from "./partitionFindings";

const mockComment = vi.fn();
const runGhGraphql = vi.fn();
const real = vi.hoisted(() => ({ comment: undefined as unknown }));

vi.mock("../prs/comment", async (importOriginal) => {
	const actual = await importOriginal<{ comment: typeof realCommentFn }>();
	real.comment = actual.comment;
	return { comment: (...args: unknown[]) => mockComment(...args) };
});
vi.mock("../../shared/runGhGraphql", () => ({
	runGhGraphql: (...args: unknown[]) => runGhGraphql(...args),
}));
vi.mock("../prs/shared", () => ({
	getCurrentPrNodeId: () => "PR_node",
	isGhNotInstalled: () => false,
}));

import { buildCommentBody, postFindings } from "./postFindings";

const FINDING: LineBoundFinding = {
	title: "Null pointer dereference",
	severity: "blocker",
	source: "confirmed",
	location: "src/foo.ts:42",
	impact: "Crash on null input.",
	recommendation: "Add a null guard before dereferencing.",
	file: "src/foo.ts",
	line: 42,
};

describe("buildCommentBody", () => {
	it("includes severity, title, impact and recommendation", () => {
		const body = buildCommentBody(FINDING);
		expect(body).toContain("blocker");
		expect(body).toContain("Null pointer dereference");
		expect(body).toContain("Crash on null input.");
		expect(body).toContain("Add a null guard before dereferencing.");
	});

	it("sanitises reviewer names that would be rejected by prs comment", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "Claude flagged this and Opus also raised it.",
		});
		expect(body.toLowerCase()).not.toContain("claude");
		expect(body.toLowerCase()).not.toContain("opus");
		expect(body).toContain("the reviewer");
	});

	it("keeps identifiers that contain claude as part of a larger word", () => {
		const body = buildCommentBody({
			...FINDING,
			title: "Setting the key to false may not disable Chrome",
			impact: "`claudeSdkChrome` stays enabled.",
		});
		expect(body).toContain("claudeSdkChrome");
	});

	it("omits optional sections when blank", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "",
			recommendation: "",
		});
		expect(body).toContain("blocker");
		expect(body).not.toContain("Impact:");
		expect(body).not.toContain("Recommendation:");
	});
});

const SECOND_FINDING: LineBoundFinding = {
	...FINDING,
	title: "Missing env lock",
	location: "src/bar.ts:10",
	file: "src/bar.ts",
	line: 10,
	startLine: 8,
};

describe("postFindings", () => {
	beforeEach(() => {
		mockComment.mockReset();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("posts every finding without the preview pane", async () => {
		mockComment.mockResolvedValue(undefined);

		const result = await postFindings([FINDING, SECOND_FINDING]);

		expect(result).toEqual({ posted: 2, failed: [] });
		expect(mockComment).toHaveBeenNthCalledWith(
			1,
			"src/foo.ts",
			42,
			expect.any(String),
			{ startLine: undefined, skipPreview: true },
		);
		expect(mockComment).toHaveBeenNthCalledWith(
			2,
			"src/bar.ts",
			10,
			expect.any(String),
			{ startLine: 8, skipPreview: true },
		);
	});

	it("posts one finding at a time", async () => {
		let inFlight = 0;
		let overlapped = false;
		mockComment.mockImplementation(async () => {
			inFlight++;
			overlapped ||= inFlight > 1;
			await Promise.resolve();
			inFlight--;
		});

		await postFindings([FINDING, SECOND_FINDING]);

		expect(overlapped).toBe(false);
	});

	it("returns a rejected post's finding as failed", async () => {
		mockComment
			.mockRejectedValueOnce(new Error("outside the diff"))
			.mockResolvedValueOnce(undefined);

		const result = await postFindings([FINDING, SECOND_FINDING]);

		expect(result).toEqual({ posted: 1, failed: [FINDING] });
	});

	describe("through the real prs comment guard", () => {
		beforeEach(() => {
			mockComment.mockImplementation(real.comment as typeof realCommentFn);
			runGhGraphql.mockReset();
			runGhGraphql.mockReturnValue(
				JSON.stringify({
					data: { addPullRequestReviewThread: { thread: { id: "T_1" } } },
				}),
			);
			vi.spyOn(console, "log").mockImplementation(() => {});
		});

		it("posts a finding naming claudeSdkChrome", async () => {
			const result = await postFindings([
				{
					...FINDING,
					title: "Setting the key to false may not disable Chrome",
					impact: "`claudeSdkChrome` stays enabled.",
				},
			]);

			expect(result).toEqual({ posted: 1, failed: [] });
			expect(runGhGraphql).toHaveBeenCalledTimes(1);
		});

		it("carries on past a body the guard rejects", async () => {
			const rejected = { ...FINDING, impact: "Mail noreply@openai.com." };

			const result = await postFindings([rejected, SECOND_FINDING]);

			expect(result).toEqual({ posted: 1, failed: [rejected] });
			expect(runGhGraphql).toHaveBeenCalledTimes(1);
		});
	});
});
