import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

const mockRequestPreviewDecision = vi.fn();

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

import { commentIssue } from "./commentIssue";

beforeEach(() => {
	vi.mocked(execFileSync).mockReset();
	mockRequestPreviewDecision.mockReset();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

function exitThrows() {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

describe("commentIssue arguments", () => {
	it("requires a body", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(commentIssue("42", {})).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("requires a numeric issue", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(commentIssue("main", { body: "Details" })).rejects.toThrow(
			"process.exit",
		);
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("delegates to gh issue comment", async () => {
		await commentIssue("42", { body: "Fixed in the latest release." });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["issue", "comment", "42", "--body", "Fixed in the latest release."],
			expect.anything(),
		);
	});

	it("passes the target repo through", async () => {
		await commentIssue("42", { body: "Details", repo: "acme/widgets" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--repo", "acme/widgets"]),
			expect.anything(),
		);
	});

	it("rejects a body referencing claude", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			commentIssue("42", { body: "Claude looked into this." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("rejects a body referencing a backlog item", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			commentIssue("42", { body: "Tracked as a706." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("commentIssue preview", () => {
	it("posts without a preview outside a web session", async () => {
		await commentIssue("42", { body: "Details" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).toHaveBeenCalled();
	});

	it("previews the comment in a web session and posts it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await commentIssue("42", { body: "Details", repo: "acme/widgets" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Comment on acme/widgets#42",
				body: "Details",
				kind: "github-issue-comment",
				prNumber: null,
			}),
		);
		expect(execFileSync).toHaveBeenCalled();
	});

	it("exits non-zero without posting when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "too terse",
			comments: [{ quote: "Details", note: "say which commit" }],
		});

		await expect(commentIssue("42", { body: "Details" })).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("too terse");
		expect(output).toContain("> Details");
		expect(output).toContain("say which commit");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});
