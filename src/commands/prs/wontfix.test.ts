import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const resolveCommentWithReply = vi.fn();

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("./resolveCommentWithReply", () => ({
	resolveCommentWithReply: (...args: unknown[]) =>
		resolveCommentWithReply(...args),
}));
vi.mock("./shared", () => ({ isGhNotInstalled: () => false }));
const target = { org: "acme", repo: "widgets", prNumber: 7 };
vi.mock("./threadTarget", () => ({ threadTarget: () => target }));
const loadCommentsCache = vi.fn();
vi.mock("./loadCommentsCache", () => ({
	loadCommentsCache: (...args: unknown[]) => loadCommentsCache(...args),
}));

const commentUrl = "https://github.com/acme/widgets/pull/7#discussion_r123";

import { wontfix } from "./wontfix";

beforeEach(() => {
	mockRequestPreviewDecision.mockReset();
	resolveCommentWithReply.mockReset();
	loadCommentsCache.mockReset();
	loadCommentsCache.mockReturnValue(null);
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("wontfix", () => {
	it("resolves without a preview outside a web session", async () => {
		await wontfix(123, "Out of scope for this PR");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(resolveCommentWithReply).toHaveBeenCalledWith(
			target,
			123,
			"Out of scope for this PR",
		);
	});

	it("previews the reason in a web session and resolves on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await wontfix(123, "Out of scope for this PR");

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Won't fix comment #123",
				body: "Out of scope for this PR",
				kind: "pr-comment",
				prNumber: null,
				titleLink: undefined,
			}),
		);
		expect(resolveCommentWithReply).toHaveBeenCalled();
	});

	it("links the comment number to the cached comment's URL", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		loadCommentsCache.mockReturnValue({
			comments: [{ type: "line", id: 123, html_url: commentUrl }],
		});

		await wontfix(123, "Out of scope for this PR");

		expect(loadCommentsCache).toHaveBeenCalledWith("acme", "widgets", 7);
		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				titleLink: { reference: "#123", url: commentUrl },
			}),
		);
	});

	it("exits non-zero without resolving when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "we should fix it",
			comments: [{ quote: "Out of scope", note: "it is in scope" }],
		});

		await expect(wontfix(123, "Out of scope for this PR")).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("we should fix it");
		expect(output).toContain("> Out of scope");
		expect(output).toContain("it is in scope");
		expect(resolveCommentWithReply).not.toHaveBeenCalled();
	});

	it("rejects a reason that mentions the assistant", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);

		await expect(wontfix(123, "Handled by Claude")).rejects.toThrow(
			"process.exit",
		);
		expect(resolveCommentWithReply).not.toHaveBeenCalled();
	});
});
