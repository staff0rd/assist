import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestAssistSession = vi.fn();

vi.mock("../sessions/shared/requestAssistSession", () => ({
	requestAssistSession: (...args: unknown[]) =>
		mockRequestAssistSession(...args),
}));

import { chainAddressComments } from "./chainAddressComments";

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	mockRequestAssistSession.mockResolvedValue("session-1");
	process.env.ASSIST_SESSION = "1";
});

afterEach(() => {
	delete process.env.ASSIST_SESSION;
});

describe("chainAddressComments", () => {
	it("should request a review-pr-comments session for the PR", async () => {
		await chainAddressComments(42, false);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			process.cwd(),
			{ inPlace: true },
		);
	});

	it("should pass --announce so the session announces when it is done", async () => {
		await chainAddressComments(42, true);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			["review-pr-comments", "42", "--announce"],
			process.cwd(),
			{ inPlace: true },
		);
	});

	it("runs the Address Comments session on the review's harness", async () => {
		await chainAddressComments(42, true, "codex");

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			["review-pr-comments", "42", "--harness", "codex", "--announce"],
			process.cwd(),
			{ inPlace: true },
		);
	});

	describe("when not running inside an assist session", () => {
		it("should not request a session", async () => {
			delete process.env.ASSIST_SESSION;

			await chainAddressComments(42, false);

			expect(mockRequestAssistSession).not.toHaveBeenCalled();
		});
	});

	describe("when the daemon request fails", () => {
		it("should warn instead of throwing", async () => {
			mockRequestAssistSession.mockRejectedValue(new Error("no daemon"));

			await expect(chainAddressComments(42, false)).resolves.toBeUndefined();

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no daemon"),
			);
		});
	});
});
