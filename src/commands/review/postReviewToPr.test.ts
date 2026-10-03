import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";
import type { LineBoundFinding } from "./partitionFindings";
import { postReviewToPr } from "./postReviewToPr";

const mockPostAndMaybeSubmit = vi.fn();
const mockChainAfterReview = vi.fn();
const mockSelectPostableFindings = vi.fn();
const mockPromptConfirm = vi.fn();
const mockStillOnReviewedPr = vi.fn();

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

vi.mock("./stillOnReviewedPr", () => ({
	stillOnReviewedPr: (...args: unknown[]) => mockStillOnReviewedPr(...args),
}));

vi.mock("./selectPostableFindings", () => ({
	selectPostableFindings: (...args: unknown[]) =>
		mockSelectPostableFindings(...args),
}));

vi.mock("./postAndMaybeSubmit", () => ({
	postAndMaybeSubmit: (...args: unknown[]) => mockPostAndMaybeSubmit(...args),
}));

vi.mock("./chainAfterReview", () => ({
	chainAfterReview: (...args: unknown[]) => mockChainAfterReview(...args),
}));

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

const finding = { file: "a.ts", line: 1 } as LineBoundFinding;
const prInfo = { prNumber: 42, baseSha: "base", headSha: "head" };
const options = {
	prompt: false,
	submit: true,
	addressComments: true,
	announce: true,
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.mocked(readFileSync).mockReturnValue("synthesis markdown");
	mockSelectPostableFindings.mockReturnValue({
		inDiff: [finding],
		unanchored: [],
	});
	mockPostAndMaybeSubmit.mockResolvedValue({ posted: 1, submitted: true });
	mockPromptConfirm.mockResolvedValue(true);
	mockStillOnReviewedPr.mockReturnValue(true);
});

describe("postReviewToPr", () => {
	it("should hand the post outcome to the chain", async () => {
		await postReviewToPr("synthesis.md", prInfo, options);

		expect(mockChainAfterReview).toHaveBeenCalledWith(
			42,
			{ posted: 1, submitted: true },
			options,
		);
	});

	it("should pass the un-anchorable findings on to the submit step", async () => {
		const carried = [{ title: "outside the diff", reason: "out-of-diff" }];
		mockSelectPostableFindings.mockReturnValue({
			inDiff: [finding],
			unanchored: carried,
		});

		await postReviewToPr("synthesis.md", prInfo, options);

		expect(mockPostAndMaybeSubmit).toHaveBeenCalledWith(
			[finding],
			carried,
			"synthesis markdown",
			options,
		);
	});

	describe("when there are no findings to post", () => {
		it("should still run the chain with nothing posted", async () => {
			mockSelectPostableFindings.mockReturnValue({
				inDiff: [],
				unanchored: [],
			});

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				options,
			);
		});

		it("should not post when the only un-anchorable finding was already raised", async () => {
			mockSelectPostableFindings.mockReturnValue({
				inDiff: [],
				unanchored: [{ title: "covered", source: "already-raised" }],
			});

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
		});
	});

	describe("when no finding falls inside the diff", () => {
		beforeEach(() => {
			mockSelectPostableFindings.mockReturnValue({
				inDiff: [],
				unanchored: [{ title: "outside the diff", reason: "out-of-diff" }],
			});
		});

		it("should still hand the un-anchorable findings to the submit step", async () => {
			mockPostAndMaybeSubmit.mockResolvedValue({ posted: 0, submitted: true });

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockPostAndMaybeSubmit).toHaveBeenCalledWith(
				[],
				[{ title: "outside the diff", reason: "out-of-diff" }],
				"synthesis markdown",
				options,
			);
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: true },
				options,
			);
		});

		it("should ask only about the review body findings", async () => {
			await postReviewToPr("synthesis.md", prInfo, {
				...options,
				prompt: true,
			});

			expect(mockPromptConfirm).toHaveBeenCalledWith(
				"Post 1 finding(s) in the review body to PR #42?",
				false,
			);
		});
	});

	describe("when the diff holds some findings and others cannot be anchored", () => {
		it("should state both counts in the confirm prompt", async () => {
			mockSelectPostableFindings.mockReturnValue({
				inDiff: [finding, finding],
				unanchored: [{ title: "outside the diff", reason: "out-of-diff" }],
			});

			await postReviewToPr("synthesis.md", prInfo, {
				...options,
				prompt: true,
			});

			expect(mockPromptConfirm).toHaveBeenCalledWith(
				"Post 2 line comment(s) and 1 finding(s) in the review body to PR #42?",
				false,
			);
		});
	});

	describe("when the tree moved off the reviewed PR", () => {
		it("should post nothing and chain nothing", async () => {
			mockStillOnReviewedPr.mockReturnValue(false);

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockSelectPostableFindings).not.toHaveBeenCalled();
			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).not.toHaveBeenCalled();
		});
	});

	describe("when the user declines posting", () => {
		it("should still run the chain with nothing posted", async () => {
			mockPromptConfirm.mockResolvedValue(false);

			await postReviewToPr("synthesis.md", prInfo, {
				...options,
				prompt: true,
			});

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				expect.objectContaining({ announce: true }),
			);
		});
	});
});
