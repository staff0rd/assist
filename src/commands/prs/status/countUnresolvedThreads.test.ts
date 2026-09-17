import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchReviewThreads = vi.fn();

vi.mock("./fetchReviewThreads", () => ({
	fetchReviewThreads: (...args: unknown[]) => mockFetchReviewThreads(...args),
}));

import { countUnresolvedThreads } from "./countUnresolvedThreads";

describe("countUnresolvedThreads", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("counts only the threads that are not resolved", () => {
		mockFetchReviewThreads.mockReturnValue([
			{ isResolved: false },
			{ isResolved: true },
			{ isResolved: false },
		]);

		expect(countUnresolvedThreads("org", "foo", 12)).toBe(2);
		expect(mockFetchReviewThreads).toHaveBeenCalledWith("org", "foo", 12);
	});

	it("counts zero when every thread is resolved", () => {
		mockFetchReviewThreads.mockReturnValue([
			{ isResolved: true },
			{ isResolved: true },
		]);

		expect(countUnresolvedThreads("org", "foo", 12)).toBe(0);
	});

	it("counts zero when the pull request has no threads", () => {
		mockFetchReviewThreads.mockReturnValue([]);

		expect(countUnresolvedThreads("org", "foo", 12)).toBe(0);
	});

	describe("when the thread query fails", () => {
		it("reports an unknown count", () => {
			mockFetchReviewThreads.mockImplementation(() => {
				throw new Error("gh exited with code 1");
			});

			expect(countUnresolvedThreads("org", "foo", 12)).toBeNull();
		});
	});
});
