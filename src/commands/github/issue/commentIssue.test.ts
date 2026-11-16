import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

const mockRequestPreviewDecision = vi.fn();
const stageScreenshots = vi.fn(async (shots: { path: string }[] = []) =>
	shots.map((s) => ({ ...s, path: `/staged/${s.path.split("/").pop()}` })),
);

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

vi.mock("../../prs/stageScreenshots", () => ({
	stageScreenshots: (...args: unknown[]) =>
		stageScreenshots(...(args as [{ path: string }[]])),
}));

import { commentIssue } from "./commentIssue";

beforeEach(() => {
	vi.mocked(execFileSync).mockReset();
	vi.mocked(execFileSync).mockReturnValue(
		"https://github.com/acme/widgets/issues/42#issuecomment-1\n",
	);
	mockRequestPreviewDecision.mockReset();
	stageScreenshots.mockClear();
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

describe("commentIssue --screenshot", () => {
	function screenshotFile(name: string): string {
		const path = join(mkdtempSync(join(tmpdir(), "comment-screenshot-")), name);
		writeFileSync(path, "");
		return path;
	}

	it("pre-stages the screenshots in the preview and attaches what the reviewer kept", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const shot = screenshotFile("crash.png");
		mockRequestPreviewDecision.mockImplementation(
			async (request: { screenshots?: { path: string; alt: string }[] }) => ({
				decision: "approve",
				screenshots: [
					...(request.screenshots ?? []),
					{ path: "/staged/dropped.png", alt: "dropped" },
				],
			}),
		);

		await commentIssue("42", {
			body: "Details",
			screenshot: [`Crash=${shot}`],
		});

		const request = mockRequestPreviewDecision.mock.calls[0]?.[0];
		expect(request?.body).toBe("Details");
		expect(request?.screenshots).toEqual([
			{ path: "/staged/crash.png", alt: "Crash" },
		]);
		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"comment",
				"42",
				"--body",
				"Details\n\n## Screenshots\n\n![Crash](/staged/crash.png)\n\n![dropped](/staged/dropped.png)",
				"--attach",
				"/staged/crash.png",
				"--attach",
				"/staged/dropped.png",
			],
			expect.anything(),
		);
	});

	it("attaches nothing when the reviewer removed the pre-staged screenshot", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await commentIssue("42", {
			body: "Details",
			screenshot: [`Crash=${screenshotFile("crash.png")}`],
		});

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["issue", "comment", "42", "--body", "Details"],
			expect.anything(),
		);
	});

	it("appends and attaches the screenshots directly outside a web session", async () => {
		const shot = screenshotFile("crash.png");

		await commentIssue("42", {
			body: "Details",
			screenshot: [`Crash=${shot}`],
		});

		expect(stageScreenshots).not.toHaveBeenCalled();
		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"comment",
				"42",
				"--body",
				`Details\n\n## Screenshots\n\n![Crash](${shot})`,
				"--attach",
				shot,
			],
			expect.anything(),
		);
	});

	it.each([
		["a missing file", () => "Crash=missing.png", "file not found"],
		[
			"an extension gh cannot attach",
			() => `Log=${screenshotFile("crash.txt")}`,
			"gh cannot attach .txt",
		],
	])("exits before any preview on %s", async (_, spec, message) => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			commentIssue("42", { body: "Details", screenshot: [spec()] }),
		).rejects.toThrow("process.exit");

		expect(errorSpy.mock.calls[0]?.[0]).toContain(message);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).not.toHaveBeenCalled();
	});
});
