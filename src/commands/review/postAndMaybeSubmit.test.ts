import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding, UnanchoredFinding } from "./partitionFindings";

const mockPostFindings = vi.fn();
const mockPromptConfirm = vi.fn();
const mockSubmitPendingReview = vi.fn();
const mockSubmitBodyOnlyReview = vi.fn();
const mockSetSessionStatus = vi.fn();
const mockBuildReviewSummary = vi.fn();

vi.mock("./postFindings", () => ({
	postFindings: (...args: unknown[]) => mockPostFindings(...args),
}));

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

vi.mock("./submitPendingReview", () => ({
	submitPendingReview: (...args: unknown[]) => mockSubmitPendingReview(...args),
}));

vi.mock("./submitBodyOnlyReview", () => ({
	submitBodyOnlyReview: (...args: unknown[]) =>
		mockSubmitBodyOnlyReview(...args),
}));

vi.mock("./buildReviewSummary", () => ({
	buildReviewSummary: (...args: unknown[]) => mockBuildReviewSummary(...args),
}));

vi.mock("./sanitiseReviewerNames", () => ({
	sanitiseReviewerNames: (body: string) => body,
}));

vi.mock("../sessions/setSessionStatus", () => ({
	setSessionStatus: (...args: unknown[]) => mockSetSessionStatus(...args),
}));

import { postAndMaybeSubmit } from "./postAndMaybeSubmit";

const findings: LineBoundFinding[] = [];

const carriedFinding: UnanchoredFinding = {
	title: "Stale doc summary",
	severity: "major",
	source: "confirmed",
	location: "docs/notes.md:5",
	impact: "impact",
	recommendation: "recommendation",
	reason: "out-of-diff",
};

const rejectedFinding: LineBoundFinding = {
	title: "Unchecked submit result",
	severity: "major",
	source: "confirmed",
	location: "src/review.mjs:441",
	impact: "impact",
	recommendation: "recommendation",
	file: "src/review.mjs",
	line: 441,
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	mockBuildReviewSummary.mockImplementation((markdown: string) => markdown);
	mockSubmitPendingReview.mockReturnValue(true);
	mockSubmitBodyOnlyReview.mockReturnValue(true);
});

describe("postAndMaybeSubmit", () => {
	describe("when prompting for confirmation", () => {
		beforeEach(() => {
			mockPostFindings.mockReturnValue({ posted: 1, failed: [] });
		});

		it("should mark the session waiting while the prompt is open", async () => {
			let statusAtPrompt: unknown;
			mockPromptConfirm.mockImplementation(() => {
				statusAtPrompt = mockSetSessionStatus.mock.calls.at(-1)?.[0];
				return Promise.resolve(false);
			});

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: true,
				submit: false,
			});

			expect(statusAtPrompt).toBe("waiting");
		});

		it("should restore running after the prompt resolves", async () => {
			mockPromptConfirm.mockResolvedValue(true);

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: true,
				submit: false,
			});

			expect(mockSetSessionStatus.mock.calls).toEqual([
				["waiting"],
				["running"],
			]);
			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
		});

		it("should restore running even when the prompt throws", async () => {
			mockPromptConfirm.mockRejectedValue(new Error("boom"));

			await expect(
				postAndMaybeSubmit(findings, [], "md", { prompt: true, submit: false }),
			).rejects.toThrow("boom");

			expect(mockSetSessionStatus).toHaveBeenLastCalledWith("running");
		});
	});

	describe("when not prompting", () => {
		it("should not touch the session status", async () => {
			mockPostFindings.mockReturnValue({ posted: 1, failed: [] });

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});

			expect(mockSetSessionStatus).not.toHaveBeenCalled();
			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
		});

		it("should report what was posted and submitted", async () => {
			mockPostFindings.mockReturnValue({ posted: 3, failed: [] });

			const outcome = await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});

			expect(outcome).toEqual({ posted: 3, submitted: true });
		});

		it("should report an unsubmitted review", async () => {
			mockPostFindings.mockReturnValue({ posted: 3, failed: [] });

			const outcome = await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: false,
			});

			expect(outcome).toEqual({ posted: 3, submitted: false });
		});
	});

	describe("when submitting", () => {
		it("should submit the pending review a failed line comment left behind", async () => {
			mockPostFindings.mockReturnValue({
				posted: 0,
				failed: [rejectedFinding],
			});
			mockSubmitPendingReview.mockReturnValue(true);

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});

			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
			expect(mockSubmitBodyOnlyReview).not.toHaveBeenCalled();
		});

		it("should submit a body-only review when failed line comments left no pending review", async () => {
			mockPostFindings.mockReturnValue({
				posted: 0,
				failed: [rejectedFinding],
			});
			mockSubmitPendingReview.mockReturnValue(false);
			mockSubmitBodyOnlyReview.mockReturnValue(true);

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});

			expect(mockSubmitBodyOnlyReview).toHaveBeenCalledWith("md");
		});

		it("should use the synthesis summary as the pending and body-only review bodies", async () => {
			mockPostFindings.mockReturnValueOnce({ posted: 1, failed: [] });
			await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});
			mockPostFindings.mockReturnValueOnce({ posted: 0, failed: [] });
			await postAndMaybeSubmit(findings, [carriedFinding], "md", {
				prompt: false,
				submit: true,
			});

			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
			expect(mockSubmitBodyOnlyReview).toHaveBeenCalledWith("md");
		});
	});

	describe("when findings could not be anchored", () => {
		it("should hand them to the review body builder", async () => {
			mockPostFindings.mockReturnValue({ posted: 1, failed: [] });
			const carried = [carriedFinding];

			await postAndMaybeSubmit(findings, carried, "md", {
				prompt: false,
				submit: true,
			});

			expect(mockBuildReviewSummary).toHaveBeenCalledWith("md", carried);
		});
	});

	describe("when GitHub rejects a line comment", () => {
		beforeEach(() => {
			mockPostFindings.mockReturnValue({
				posted: 0,
				failed: [rejectedFinding],
			});
		});

		it("should carry its finding into the review body", async () => {
			await postAndMaybeSubmit(findings, [carriedFinding], "md", {
				prompt: false,
				submit: true,
			});

			expect(mockBuildReviewSummary).toHaveBeenCalledWith("md", [
				carriedFinding,
				{ ...rejectedFinding, reason: "comment-rejected" },
			]);
		});

		it("should submit the body outside CI", async () => {
			const outcome = await postAndMaybeSubmit(findings, [], "md", {
				prompt: false,
				submit: true,
			});

			expect(outcome).toEqual({ posted: 0, submitted: true });
		});
	});

	describe("when no comments were posted but findings were carried", () => {
		beforeEach(() => {
			mockPostFindings.mockReturnValue({ posted: 0, failed: [] });
		});

		it("should submit the body as a review of its own", async () => {
			const outcome = await postAndMaybeSubmit(
				findings,
				[carriedFinding],
				"md",
				{
					prompt: false,
					submit: true,
				},
			);

			expect(mockSubmitBodyOnlyReview).toHaveBeenCalledWith("md");
			expect(mockSubmitPendingReview).not.toHaveBeenCalled();
			expect(outcome).toEqual({ posted: 0, submitted: true });
		});

		it("should still ask before submitting", async () => {
			mockPromptConfirm.mockResolvedValue(false);

			const outcome = await postAndMaybeSubmit(
				findings,
				[carriedFinding],
				"md",
				{
					prompt: true,
					submit: false,
				},
			);

			expect(mockPromptConfirm).toHaveBeenCalled();
			expect(mockSubmitBodyOnlyReview).not.toHaveBeenCalled();
			expect(outcome).toEqual({ posted: 0, submitted: false });
		});
	});

	describe("when no comments were posted", () => {
		it("should not prompt or change status", async () => {
			mockPostFindings.mockReturnValue({ posted: 0, failed: [] });

			await postAndMaybeSubmit(findings, [], "md", {
				prompt: true,
				submit: false,
			});

			expect(mockSetSessionStatus).not.toHaveBeenCalled();
			expect(mockPromptConfirm).not.toHaveBeenCalled();
		});

		it("should report nothing posted or submitted", async () => {
			mockPostFindings.mockReturnValue({ posted: 0, failed: [] });

			const outcome = await postAndMaybeSubmit(findings, [], "md", {
				prompt: true,
				submit: false,
			});

			expect(outcome).toEqual({ posted: 0, submitted: false });
			expect(mockSubmitPendingReview).not.toHaveBeenCalled();
			expect(mockSubmitBodyOnlyReview).not.toHaveBeenCalled();
		});

		it("should submit nothing when the carried findings were already raised", async () => {
			mockPostFindings.mockReturnValue({ posted: 0, failed: [] });

			const outcome = await postAndMaybeSubmit(
				findings,
				[{ ...carriedFinding, source: "already-raised" }],
				"md",
				{ prompt: false, submit: true },
			);

			expect(outcome).toEqual({ posted: 0, submitted: false });
			expect(mockSubmitBodyOnlyReview).not.toHaveBeenCalled();
			expect(mockSubmitPendingReview).not.toHaveBeenCalled();
		});
	});
});
