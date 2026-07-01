import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";

const mockPostFindings = vi.fn();
const mockPromptConfirm = vi.fn();
const mockSubmitPendingReview = vi.fn();
const mockSetSessionStatus = vi.fn();

vi.mock("./postFindings", () => ({
	postFindings: (...args: unknown[]) => mockPostFindings(...args),
}));

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

vi.mock("./submitPendingReview", () => ({
	submitPendingReview: (...args: unknown[]) => mockSubmitPendingReview(...args),
}));

vi.mock("./buildReviewSummary", () => ({
	buildReviewSummary: (markdown: string) => markdown,
}));

vi.mock("./sanitiseReviewerNames", () => ({
	sanitiseReviewerNames: (body: string) => body,
}));

vi.mock("../sessions/setSessionStatus", () => ({
	setSessionStatus: (...args: unknown[]) => mockSetSessionStatus(...args),
}));

import { postAndMaybeSubmit } from "./postAndMaybeSubmit";

const findings: LineBoundFinding[] = [];

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("postAndMaybeSubmit", () => {
	describe("when prompting for confirmation", () => {
		beforeEach(() => {
			mockPostFindings.mockReturnValue({ posted: 1, failed: 0 });
		});

		it("should mark the session waiting while the prompt is open", async () => {
			let statusAtPrompt: unknown;
			mockPromptConfirm.mockImplementation(() => {
				statusAtPrompt = mockSetSessionStatus.mock.calls.at(-1)?.[0];
				return Promise.resolve(false);
			});

			await postAndMaybeSubmit(findings, "md", { prompt: true, submit: false });

			expect(statusAtPrompt).toBe("waiting");
		});

		it("should restore running after the prompt resolves", async () => {
			mockPromptConfirm.mockResolvedValue(true);

			await postAndMaybeSubmit(findings, "md", { prompt: true, submit: false });

			expect(mockSetSessionStatus.mock.calls).toEqual([
				["waiting"],
				["running"],
			]);
			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
		});

		it("should restore running even when the prompt throws", async () => {
			mockPromptConfirm.mockRejectedValue(new Error("boom"));

			await expect(
				postAndMaybeSubmit(findings, "md", { prompt: true, submit: false }),
			).rejects.toThrow("boom");

			expect(mockSetSessionStatus).toHaveBeenLastCalledWith("running");
		});
	});

	describe("when not prompting", () => {
		it("should not touch the session status", async () => {
			mockPostFindings.mockReturnValue({ posted: 1, failed: 0 });

			await postAndMaybeSubmit(findings, "md", { prompt: false, submit: true });

			expect(mockSetSessionStatus).not.toHaveBeenCalled();
			expect(mockSubmitPendingReview).toHaveBeenCalledWith("md");
		});
	});

	describe("when no comments were posted", () => {
		it("should not prompt or change status", async () => {
			mockPostFindings.mockReturnValue({ posted: 0, failed: 0 });

			await postAndMaybeSubmit(findings, "md", { prompt: true, submit: false });

			expect(mockSetSessionStatus).not.toHaveBeenCalled();
			expect(mockPromptConfirm).not.toHaveBeenCalled();
		});
	});
});
