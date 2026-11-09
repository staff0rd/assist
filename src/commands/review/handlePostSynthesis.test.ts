import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPostReviewToPr = vi.fn();
const mockAnnouncePr = vi.fn();
const mockRunReviewSession = vi.fn();

vi.mock("./postReviewToPr", () => ({
	postReviewToPr: (...args: unknown[]) => mockPostReviewToPr(...args),
}));

vi.mock("./announcePr", () => ({
	announcePr: (...args: unknown[]) => mockAnnouncePr(...args),
}));

vi.mock("./runReviewSession", () => ({
	runReviewSession: (...args: unknown[]) => mockRunReviewSession(...args),
}));

import { applySession } from "./applySession";
import { backlogSession } from "./backlogSession";
import { handlePostSynthesis } from "./handlePostSynthesis";
import { refineSession } from "./refineSession";

const prInfo = { prNumber: 42, baseSha: "base", headSha: "head" };

const base = {
	refine: false,
	apply: false,
	backlog: false,
	prompt: false,
	submit: true,
	addressComments: false,
	announce: false,
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("handlePostSynthesis", () => {
	describe("on the posting path", () => {
		it("should leave the chaining to postReviewToPr", async () => {
			await handlePostSynthesis("synthesis.md", prInfo, {
				...base,
				addressComments: true,
				announce: true,
			});

			expect(mockPostReviewToPr).toHaveBeenCalledWith("synthesis.md", prInfo, {
				prompt: false,
				submit: true,
				addressComments: true,
				announce: true,
			});
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});

	describe("on a non-posting mode with --announce", () => {
		it.each([["refine"], ["apply"], ["backlog"]])(
			"should announce after the %s session",
			async (mode) => {
				await handlePostSynthesis("synthesis.md", prInfo, {
					...base,
					[mode]: true,
					announce: true,
				});

				expect(mockPostReviewToPr).not.toHaveBeenCalled();
				expect(mockAnnouncePr).toHaveBeenCalledWith(42);
			},
		);
	});

	describe("on a non-posting mode without --announce", () => {
		it("should not announce", async () => {
			await handlePostSynthesis("synthesis.md", prInfo, {
				...base,
				apply: true,
			});

			expect(mockRunReviewSession).toHaveBeenCalledWith(
				applySession,
				"synthesis.md",
				undefined,
			);
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});

	describe("harness selection", () => {
		it.each([
			["refine", refineSession],
			["apply", applySession],
			["backlog", backlogSession],
		] as const)(
			"should launch the %s session on the selected harness",
			async (mode, session) => {
				await handlePostSynthesis("synthesis.md", prInfo, {
					...base,
					[mode]: true,
					harness: "codex",
				});

				expect(mockRunReviewSession).toHaveBeenCalledWith(
					session,
					"synthesis.md",
					"codex",
				);
			},
		);
	});
});
