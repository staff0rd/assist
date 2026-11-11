import { beforeEach, describe, expect, it, vi } from "vitest";

const mockChainAddressComments = vi.fn();
const mockAnnouncePr = vi.fn();

vi.mock("./chainAddressComments", () => ({
	chainAddressComments: (...args: unknown[]) =>
		mockChainAddressComments(...args),
}));

vi.mock("./announcePr", () => ({
	announcePr: (...args: unknown[]) => mockAnnouncePr(...args),
}));

import { chainAfterReview } from "./chainAfterReview";

const POSTED = { posted: 2, submitted: true };
const UNSUBMITTED = { posted: 2, submitted: false };
const NOTHING = { posted: 0, submitted: false };

beforeEach(() => {
	vi.clearAllMocks();
});

describe("chainAfterReview", () => {
	describe("when comments were posted and submitted", () => {
		it("should chain Address Comments and leave the announce to it", async () => {
			await chainAfterReview(42, POSTED, {
				addressComments: true,
				announce: true,
			});

			expect(mockChainAddressComments).toHaveBeenCalledWith(
				42,
				true,
				undefined,
			);
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});

		it("should chain Address Comments without an announce when not asked", async () => {
			await chainAfterReview(42, POSTED, {
				addressComments: true,
				announce: false,
			});

			expect(mockChainAddressComments).toHaveBeenCalledWith(
				42,
				false,
				undefined,
			);
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});

		it("should chain Address Comments on the review's harness", async () => {
			await chainAfterReview(42, POSTED, {
				addressComments: true,
				announce: false,
				harness: "codex",
			});

			expect(mockChainAddressComments).toHaveBeenCalledWith(42, false, "codex");
		});

		it("should announce directly when Address Comments was not asked for", async () => {
			await chainAfterReview(42, POSTED, {
				addressComments: false,
				announce: true,
			});

			expect(mockChainAddressComments).not.toHaveBeenCalled();
			expect(mockAnnouncePr).toHaveBeenCalledWith(42);
		});
	});

	describe("when nothing was posted", () => {
		it("should announce directly instead of chaining Address Comments", async () => {
			await chainAfterReview(42, NOTHING, {
				addressComments: true,
				announce: true,
			});

			expect(mockChainAddressComments).not.toHaveBeenCalled();
			expect(mockAnnouncePr).toHaveBeenCalledWith(42);
		});
	});

	describe("when the review was left unsubmitted", () => {
		it("should announce directly instead of chaining Address Comments", async () => {
			await chainAfterReview(42, UNSUBMITTED, {
				addressComments: true,
				announce: true,
			});

			expect(mockChainAddressComments).not.toHaveBeenCalled();
			expect(mockAnnouncePr).toHaveBeenCalledWith(42);
		});
	});

	describe("with neither flag", () => {
		it("should chain nothing", async () => {
			await chainAfterReview(42, POSTED, {
				addressComments: false,
				announce: false,
			});

			expect(mockChainAddressComments).not.toHaveBeenCalled();
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});
});
