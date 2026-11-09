import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestClaudeSession = vi.fn();

vi.mock("../sessions/shared/requestPromptSession", () => ({
	requestPromptSession: (...args: unknown[]) =>
		mockRequestClaudeSession(...args),
}));

import { announcePr } from "./announcePr";

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	mockRequestClaudeSession.mockResolvedValue("session-1");
	process.env.ASSIST_SESSION = "1";
});

afterEach(() => {
	delete process.env.ASSIST_SESSION;
});

describe("announcePr", () => {
	it("should request a hands-off /prs-slack session in the current tree", async () => {
		await announcePr(42);

		expect(mockRequestClaudeSession).toHaveBeenCalledWith(
			"/prs-slack 42 --no-confirm",
			process.cwd(),
			{ inPlace: true },
		);
	});

	describe("when not running inside an assist session", () => {
		it("should not request a session", async () => {
			delete process.env.ASSIST_SESSION;

			await announcePr(42);

			expect(mockRequestClaudeSession).not.toHaveBeenCalled();
		});
	});
});
