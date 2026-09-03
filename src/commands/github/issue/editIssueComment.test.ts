import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const mockRequestPreviewDecision = vi.fn();
const mockGetRepoInfo = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("../../prs/shared", () => ({
	getRepoInfo: () => mockGetRepoInfo(),
}));

import { editIssueComment } from "./editIssueComment";

beforeEach(() => {
	execFileSync.mockReset();
	execFileSync.mockReturnValue("{}");
	mockRequestPreviewDecision.mockReset();
	mockGetRepoInfo.mockReset();
	mockGetRepoInfo.mockReturnValue({ org: "acme", repo: "widgets" });
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

describe("editIssueComment arguments", () => {
	it("requires a body", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(editIssueComment("12345", {})).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("requires a numeric comment id", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssueComment("issuecomment-12345", { body: "Details" }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("patches the comment on the current repo", async () => {
		await editIssueComment("12345", { body: "Fixed in the latest release." });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"api",
				"-X",
				"PATCH",
				"repos/acme/widgets/issues/comments/12345",
				"--input",
				"-",
			],
			expect.objectContaining({
				input: JSON.stringify({ body: "Fixed in the latest release." }),
			}),
		);
	});

	it("patches the comment on the target repo", async () => {
		await editIssueComment("12345", { body: "Details", repo: "other/thing" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["repos/other/thing/issues/comments/12345"]),
			expect.anything(),
		);
	});

	it("rejects a body referencing claude", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssueComment("12345", { body: "Claude looked into this." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("rejects a body referencing a backlog item", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssueComment("12345", { body: "Tracked as a706." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("editIssueComment preview", () => {
	it("patches without a preview outside a web session", async () => {
		await editIssueComment("12345", { body: "Details" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).toHaveBeenCalled();
	});

	it("previews the replacement in a web session and patches on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssueComment("12345", { body: "Details" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Amend acme/widgets comment 12345",
				body: "Details",
				kind: "github-issue-comment",
				prNumber: null,
			}),
		);
		expect(execFileSync).toHaveBeenCalled();
	});

	it("exits non-zero without patching when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "too terse",
		});

		await expect(
			editIssueComment("12345", { body: "Details" }),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("too terse");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});
