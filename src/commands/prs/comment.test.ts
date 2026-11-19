import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runGhGraphql = vi.fn();
const mockRequestPreviewDecision = vi.fn();

vi.mock("../../shared/runGhGraphql", () => ({
	runGhGraphql: (...args: unknown[]) => runGhGraphql(...args),
}));
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("./shared", () => ({
	getCurrentPrNodeId: () => "PR_node",
	isGhNotInstalled: () => false,
}));

import { comment } from "./comment";

const threadCreated = () =>
	JSON.stringify({
		data: { addPullRequestReviewThread: { thread: { id: "T_1" } } },
	});

beforeEach(() => {
	runGhGraphql.mockReset();
	mockRequestPreviewDecision.mockReset();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("comment thread verification", () => {
	it("throws when GitHub returns no thread id", async () => {
		runGhGraphql.mockReturnValue(
			JSON.stringify({
				data: { addPullRequestReviewThread: { thread: null } },
			}),
		);
		await expect(comment("src/foo.ts", 42, "body")).rejects.toThrow(
			/did not create a review thread/,
		);
	});

	it("succeeds when GitHub returns a thread id", async () => {
		runGhGraphql.mockReturnValue(threadCreated());
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		await expect(comment("src/foo.ts", 42, "body")).resolves.toBeUndefined();
		expect(log).toHaveBeenCalledWith("Added review comment on src/foo.ts:42");
	});
});

describe("comment body guard", () => {
	it("posts a body naming an identifier that contains claude", async () => {
		runGhGraphql.mockReturnValue(threadCreated());
		vi.spyOn(console, "log").mockImplementation(() => {});

		await comment("src/foo.ts", 42, "`claudeSdkChrome` may stay enabled");

		expect(runGhGraphql).toHaveBeenCalled();
	});

	it("throws without posting when the body names claude", async () => {
		await expect(comment("src/foo.ts", 42, "Fixed by Claude")).rejects.toThrow(
			'Body must not contain "claude" or "opus"',
		);
		expect(runGhGraphql).not.toHaveBeenCalled();
	});

	it("throws on a non-positive line", async () => {
		await expect(comment("src/foo.ts", 0, "body")).rejects.toThrow(
			"Line must be a positive integer",
		);
	});
});

describe("comment preview", () => {
	it("posts without a preview outside a web session", async () => {
		runGhGraphql.mockReturnValue(threadCreated());
		vi.spyOn(console, "log").mockImplementation(() => {});

		await comment("src/foo.ts", 42, "body");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(runGhGraphql).toHaveBeenCalled();
	});

	it("previews the comment in a web session and posts it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		runGhGraphql.mockReturnValue(threadCreated());
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await comment("src/foo.ts", 42, "body");

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Comment on src/foo.ts:42",
				body: "body",
				kind: "pr-comment",
				prNumber: null,
			}),
		);
		expect(runGhGraphql).toHaveBeenCalled();
	});

	it("titles a multi-line comment with the whole range", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		runGhGraphql.mockReturnValue(threadCreated());
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await comment("src/foo.ts", 42, "body", { startLine: 40 });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Comment on src/foo.ts:40-42" }),
		);
	});

	it("skips the preview in a web session when the caller opts out", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		runGhGraphql.mockReturnValue(threadCreated());
		vi.spyOn(console, "log").mockImplementation(() => {});

		await comment("src/foo.ts", 42, "body", { skipPreview: true });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(runGhGraphql).toHaveBeenCalled();
	});

	it("exits non-zero without posting when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "wrong line",
			comments: [{ quote: "body", note: "be specific" }],
		});

		await expect(comment("src/foo.ts", 42, "body")).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("wrong line");
		expect(output).toContain("> body");
		expect(output).toContain("be specific");
		expect(runGhGraphql).not.toHaveBeenCalled();
	});
});
