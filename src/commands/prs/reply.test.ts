import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const replyToComment = vi.fn();
const execFileSync = vi.fn();
const loadCommentsCache = vi.fn();

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("./replyToComment", () => ({
	replyToComment: (...args: unknown[]) => replyToComment(...args),
}));
vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../review/azureDevopsRemote", () => ({
	azureDevopsRemote: () => null,
}));
vi.mock("./loadCommentsCache", () => ({
	loadCommentsCache: (...args: unknown[]) => loadCommentsCache(...args),
}));
vi.mock("./shared", () => ({
	getCurrentPrNumber: () => 7,
	getRepoInfo: () => ({ org: "acme", repo: "widgets" }),
	isGhNotInstalled: () => false,
}));

import { reply } from "./reply";

const commentUrl = "https://github.com/acme/widgets/pull/7#discussion_r123";

function inWebSession(): void {
	process.env.ASSIST_SESSION = "1";
	process.env.ASSIST_SESSION_ID = "s1";
	mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
}

function previewTitleLink(): unknown {
	return mockRequestPreviewDecision.mock.calls[0]?.[0]?.titleLink;
}

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

beforeEach(() => {
	mockRequestPreviewDecision.mockReset();
	replyToComment.mockReset();
	execFileSync.mockReset();
	execFileSync.mockImplementation(() => {
		throw new Error("gh failed");
	});
	loadCommentsCache.mockReset();
	loadCommentsCache.mockReturnValue(null);
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

	it("does not look up the comment URL outside a web session", async () => {
		await reply(123, "Good catch");

		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("links the comment number to the cached comment's URL", async () => {
		inWebSession();
		loadCommentsCache.mockReturnValue({
			comments: [{ type: "line", id: 123, html_url: commentUrl }],
		});

		await reply(123, "Good catch");

		expect(loadCommentsCache).toHaveBeenCalledWith("acme", "widgets", 7);
		expect(execFileSync).not.toHaveBeenCalled();
		expect(previewTitleLink()).toEqual({ reference: "#123", url: commentUrl });
	});

	it("looks up the comment URL on GitHub when it is not cached", async () => {
		inWebSession();
		execFileSync.mockReturnValue(JSON.stringify({ html_url: commentUrl }));

		await reply(123, "Good catch");

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["api", "repos/acme/widgets/pulls/comments/123"],
			expect.anything(),
		);
		expect(previewTitleLink()).toEqual({ reference: "#123", url: commentUrl });
	});

	it("leaves the title unlinked when the lookup fails", async () => {
		inWebSession();

		await reply(123, "Good catch");

		expect(previewTitleLink()).toBeUndefined();
		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Reply to comment #123" }),
		);
		expect(replyToComment).toHaveBeenCalled();
	});
});
