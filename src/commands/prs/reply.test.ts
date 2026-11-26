import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const replyToComment = vi.fn();

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("./replyToComment", () => ({
	replyToComment: (...args: unknown[]) => replyToComment(...args),
}));
vi.mock("./shared", () => ({
	getCurrentPrNumber: () => 7,
	isGhNotInstalled: () => false,
}));
vi.mock("./getBaseRepoInfo", () => ({
	getBaseRepoInfo: () => ({ org: "acme", repo: "widgets" }),
}));

import { reply } from "./reply";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

beforeEach(() => {
	mockRequestPreviewDecision.mockReset();
	replyToComment.mockReset();
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(() => {
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("reply", () => {
	describe("when the body mentions claude", () => {
		it("should reject", async () => {
			await expect(reply(123, "Fixed by Claude")).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it("should reject regardless of case", async () => {
			await expect(reply(123, "done by CLAUDE")).rejects.toThrow(
				"process.exit",
			);
		});
	});

	describe("when the body mentions opus", () => {
		it("should reject", async () => {
			await expect(reply(123, "addressed by Opus")).rejects.toThrow(
				"process.exit",
			);
		});

		it("should reject regardless of case", async () => {
			await expect(reply(123, "addressed by OPUS")).rejects.toThrow(
				"process.exit",
			);
		});
	});

	it("posts a body naming an identifier that contains claude", async () => {
		await reply(123, "Renamed `claudeSdkChrome`");

		expect(replyToComment).toHaveBeenCalled();
	});

	it("posts without a preview outside a web session", async () => {
		await reply(123, "Good catch");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(replyToComment).toHaveBeenCalledWith(
			"acme",
			"widgets",
			7,
			123,
			"Good catch",
		);
	});

	it("previews the reply in a web session and posts it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await reply(123, "Good catch");

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Reply to comment #123",
				body: "Good catch",
				kind: "pr-comment",
				prNumber: null,
			}),
		);
		expect(replyToComment).toHaveBeenCalled();
	});

	it("exits non-zero without posting when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "too terse",
			comments: [{ quote: "Good catch", note: "say what was caught" }],
		});

		await expect(reply(123, "Good catch")).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("too terse");
		expect(output).toContain("> Good catch");
		expect(output).toContain("say what was caught");
		expect(replyToComment).not.toHaveBeenCalled();
	});
});
