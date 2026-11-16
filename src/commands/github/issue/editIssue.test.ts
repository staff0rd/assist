import { execFileSync as execFileSyncFn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

const execFileSync = vi.mocked(execFileSyncFn);
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

import { editIssue } from "./editIssue";

let storeDir: string;

const FETCHED_AT = "2026-08-01T00:00:00Z";

function issueJson(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({
		title: "Tidy the history",
		body: "# History\n\nlots of noise",
		updatedAt: FETCHED_AT,
		url: "https://github.com/acme/widgets/issues/42",
		...overrides,
	});
}

function ghViewReturns(...responses: string[]): void {
	let call = 0;
	execFileSync.mockImplementation((_command, args) => {
		if (args?.[1] !== "view") return "";
		const response = responses[Math.min(call, responses.length - 1)];
		call += 1;
		return response;
	});
}

function webSession(): void {
	process.env.ASSIST_SESSION = "1";
	process.env.ASSIST_SESSION_ID = "s1";
}

function exitThrows() {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

function workingBodyPath(): string {
	return join(storeDir, "github-issues", "acme", "widgets", "42.md");
}

function seedWorkingFile(body: string, updatedAt: string): void {
	const dir = join(storeDir, "github-issues", "acme", "widgets");
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "42.md"), body);
	writeFileSync(
		join(dir, "42.json"),
		JSON.stringify({ target: "acme/widgets#42", updatedAt }),
	);
}

function previewedBody(call = 0): string {
	return mockRequestPreviewDecision.mock.calls[call][0].body;
}

function ghCalls(verb: string) {
	return execFileSync.mock.calls.filter((call) => call[1]?.[1] === verb);
}

beforeEach(() => {
	execFileSync.mockReset();
	mockRequestPreviewDecision.mockReset();
	stageScreenshots.mockClear();
	storeDir = mkdtempSync(join(tmpdir(), "assist-issue-edit-"));
	process.env.ASSIST_STORE_DIR = storeDir;
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	vi.spyOn(console, "log").mockImplementation(() => {});
	ghViewReturns(issueJson());
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_STORE_DIR;
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("editIssue arguments", () => {
	it("requires a numeric issue", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(editIssue("main", {})).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("fetches the issue body, title and updatedAt", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { repo: "acme/widgets" });

		expect(ghCalls("view")[0]).toEqual([
			"gh",
			[
				"issue",
				"view",
				"42",
				"--json",
				"title,body,updatedAt,url",
				"--repo",
				"acme/widgets",
			],
			expect.anything(),
		]);
	});
});

describe("editIssue preview", () => {
	it("previews the fetched body under the github-issue-edit kind", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", {});

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Edit acme/widgets#42: Tidy the history",
				body: "# History\n\nlots of noise",
				kind: "github-issue-edit",
				prNumber: null,
			}),
		);
	});

	it("writes the fetched body and updatedAt to the working file", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", {});

		expect(readFileSync(workingBodyPath(), "utf8")).toBe(
			"# History\n\nlots of noise",
		);
		const meta = JSON.parse(
			readFileSync(
				join(storeDir, "github-issues", "acme", "widgets", "42.json"),
				"utf8",
			),
		);
		expect(meta).toEqual({ target: "acme/widgets#42", updatedAt: FETCHED_AT });
	});

	it("pushes the working file on approval", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { repo: "acme/widgets" });

		expect(ghCalls("edit")).toEqual([
			[
				"gh",
				[
					"issue",
					"edit",
					"42",
					"--body-file",
					workingBodyPath(),
					"--repo",
					"acme/widgets",
				],
				expect.anything(),
			],
		]);
	});

	it("pushes nothing and exits non-zero when the preview is rejected", async () => {
		webSession();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "collapse the history",
			comments: [{ quote: "lots of noise", note: "wrap this section" }],
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("collapse the history");
		expect(output).toContain("> lots of noise");
		expect(output).toContain("wrap this section");
		expect(ghCalls("edit")).toEqual([]);
	});

	it("prints the issue and pushes nothing outside a web session", async () => {
		await editIssue("42", { repo: "acme/widgets" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(ghCalls("edit")).toEqual([]);
		expect(ghCalls("view")).toEqual([
			[
				"gh",
				["issue", "view", "42", "--repo", "acme/widgets"],
				expect.anything(),
			],
		]);
	});
});

describe("editIssue staleness", () => {
	it("pushes nothing and names the working file when updatedAt moved", async () => {
		webSession();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		ghViewReturns(
			issueJson(),
			issueJson({ updatedAt: "2026-08-02T09:30:00Z" }),
		);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(ghCalls("edit")).toEqual([]);
		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("acme/widgets#42 was updated on GitHub");
		expect(output).toContain(workingBodyPath());
	});

	it("re-reads updatedAt after the preview, before pushing", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", {});

		expect(ghCalls("view")).toHaveLength(2);
		expect(ghCalls("edit")).toHaveLength(1);
	});
});

describe("editIssue edited body", () => {
	const COLLAPSED =
		"# History\n\n<details>\n<summary>Click to expand</summary>\n\nlots of noise\n\n</details>";

	it("pushes the edited markdown rather than the fetched body", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			body: COLLAPSED,
		});

		await editIssue("42", { repo: "acme/widgets" });

		expect(readFileSync(workingBodyPath(), "utf8")).toBe(COLLAPSED);
		expect(ghCalls("edit")).toHaveLength(1);
	});

	it("writes the edited markdown to the working file on Request changes", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			body: COLLAPSED,
			comments: [{ quote: "lots of noise", note: "collapse this" }],
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(readFileSync(workingBodyPath(), "utf8")).toBe(COLLAPSED);
		expect(ghCalls("edit")).toEqual([]);
	});

	it("names the working file to revise when the preview is rejected", async () => {
		webSession();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			body: COLLAPSED,
			comments: [{ quote: "lots of noise", note: "collapse this" }],
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain(workingBodyPath());
		expect(output).toContain("Revise that file in place");
	});

	it("rejects an edited body referencing Claude before pushing", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			body: "Rewritten by Claude",
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(ghCalls("edit")).toEqual([]);
	});

	it("rejects an edited body referencing an assist backlog item", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			body: "Tracked as a706.",
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(ghCalls("edit")).toEqual([]);
	});
});

describe("editIssue validation", () => {
	it("rejects a body referencing Claude before previewing or pushing", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		ghViewReturns(issueJson({ body: "Written by Claude" }));

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(ghCalls("edit")).toEqual([]);
	});

	it("rejects a body referencing an assist backlog item", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		ghViewReturns(issueJson({ body: "Tracked as a706." }));

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(ghCalls("edit")).toEqual([]);
	});
});

describe("editIssue proposed body", () => {
	const PROPOSED = "# History\n\n- [ ] checklist item";

	it("previews and pushes the proposed body on the first run", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { repo: "acme/widgets", body: PROPOSED });

		expect(mockRequestPreviewDecision).toHaveBeenCalledTimes(1);
		expect(previewedBody()).toBe(PROPOSED);
		expect(readFileSync(workingBodyPath(), "utf8")).toBe(PROPOSED);
		expect(ghCalls("edit")).toHaveLength(1);
	});

	it("takes precedence over an existing working file", async () => {
		webSession();
		seedWorkingFile("older revision", FETCHED_AT);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { body: PROPOSED });

		expect(previewedBody()).toBe(PROPOSED);
	});

	it("still pushes nothing when the issue moved after it was fetched", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		ghViewReturns(
			issueJson(),
			issueJson({ updatedAt: "2026-08-02T09:30:00Z" }),
		);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await expect(editIssue("42", { body: PROPOSED })).rejects.toThrow(
			"process.exit",
		);

		expect(ghCalls("edit")).toEqual([]);
	});

	it("rejects a proposed body referencing Claude before previewing", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssue("42", { body: "Rewritten by Claude" }),
		).rejects.toThrow("process.exit");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});
});

describe("editIssue resume", () => {
	const REVISED = "# History\n\n<details>\nrevised\n</details>";

	it("previews the working file's markdown when the issue has not moved", async () => {
		webSession();
		seedWorkingFile(REVISED, FETCHED_AT);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { repo: "acme/widgets" });

		expect(previewedBody()).toBe(REVISED);
		expect(readFileSync(workingBodyPath(), "utf8")).toBe(REVISED);
		expect(ghCalls("edit")).toHaveLength(1);
	});

	it("re-fetches when the issue moved since the working file was written", async () => {
		webSession();
		seedWorkingFile(REVISED, "2026-07-01T00:00:00Z");
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", {});

		expect(previewedBody()).toBe("# History\n\nlots of noise");
		expect(readFileSync(workingBodyPath(), "utf8")).toBe(
			"# History\n\nlots of noise",
		);
	});

	it("re-fetches regardless of the working file with --fresh", async () => {
		webSession();
		seedWorkingFile(REVISED, FETCHED_AT);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { fresh: true });

		expect(previewedBody()).toBe("# History\n\nlots of noise");
	});

	it("writes the current body to the working file with --fetch, without previewing", async () => {
		webSession();
		seedWorkingFile(REVISED, FETCHED_AT);

		await editIssue("42", { repo: "acme/widgets", fetch: true });

		expect(readFileSync(workingBodyPath(), "utf8")).toBe(
			"# History\n\nlots of noise",
		);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining(workingBodyPath()),
		);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(ghCalls("edit")).toHaveLength(0);
	});

	it("previews only the revision of a fetched body on the next run", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { fetch: true });
		writeFileSync(workingBodyPath(), REVISED);
		await editIssue("42", {});

		expect(mockRequestPreviewDecision).toHaveBeenCalledTimes(1);
		expect(previewedBody()).toBe(REVISED);
		expect(ghCalls("edit")).toHaveLength(1);
	});

	it("keeps the collapses from a Request changes on the next run", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			body: REVISED,
			comments: [{ quote: "lots of noise", note: "collapse this" }],
		});

		await expect(editIssue("42", {})).rejects.toThrow("process.exit");

		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		await editIssue("42", {});

		expect(previewedBody(1)).toBe(REVISED);
	});
});

describe("editIssue --screenshot", () => {
	function screenshotFile(name: string): string {
		const path = join(mkdtempSync(join(tmpdir(), "issue-screenshot-")), name);
		writeFileSync(path, "");
		return path;
	}

	function pushedArgs(): unknown {
		return ghCalls("edit")[0]?.[1];
	}

	it("pre-stages the screenshots beside the body and attaches what the reviewer kept", async () => {
		webSession();
		const shot = screenshotFile("crash.png");
		mockRequestPreviewDecision.mockImplementation(
			async (request: { screenshots?: unknown[] }) => ({
				decision: "approve",
				screenshots: request.screenshots,
			}),
		);

		await editIssue("42", {
			repo: "acme/widgets",
			screenshot: [`Crash=${shot}`],
		});

		expect(mockRequestPreviewDecision.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				kind: "github-issue-edit",
				body: "# History\n\nlots of noise",
				screenshots: [{ path: "/staged/crash.png", alt: "Crash" }],
			}),
		);
		expect(pushedArgs()).toEqual([
			"issue",
			"edit",
			"42",
			"--body",
			"# History\n\nlots of noise\n\n## Screenshots\n\n![Crash](/staged/crash.png)",
			"--repo",
			"acme/widgets",
			"--attach",
			"/staged/crash.png",
		]);
	});

	it("attaches a screenshot the reviewer dropped into the pane", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			body: "# History\n\nedited",
			screenshots: [{ path: "/staged/u1/drop.png", alt: "drop" }],
		});

		await editIssue("42", {});

		expect(pushedArgs()).toEqual([
			"issue",
			"edit",
			"42",
			"--body",
			"# History\n\nedited\n\n## Screenshots\n\n![drop](/staged/u1/drop.png)",
			"--attach",
			"/staged/u1/drop.png",
		]);
	});

	it("adds to an existing Screenshots section rather than replacing it", async () => {
		webSession();
		ghViewReturns(
			issueJson({
				body: "# History\n\n## Screenshots\n\n![Old](https://example.com/old.png)\n\n## Notes\n\nend",
			}),
		);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			screenshots: [{ path: "/staged/new.png", alt: "New" }],
		});

		await editIssue("42", {});

		expect(pushedArgs()).toEqual(
			expect.arrayContaining([
				"# History\n\n## Screenshots\n\n![Old](https://example.com/old.png)\n\n![New](/staged/new.png)\n\n## Notes\n\nend",
			]),
		);
	});

	it("pushes with --body-file when the reviewer removed every screenshot", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { screenshot: [`Crash=${screenshotFile("a.png")}`] });

		expect(pushedArgs()).toEqual([
			"issue",
			"edit",
			"42",
			"--body-file",
			workingBodyPath(),
		]);
	});

	it("exits before previewing when a screenshot file is missing", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssue("42", { screenshot: ["Crash=/no/such/file.png"] }),
		).rejects.toThrow("process.exit");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("exits before previewing when gh cannot attach the extension", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssue("42", { screenshot: [`Doc=${screenshotFile("notes.txt")}`] }),
		).rejects.toThrow("process.exit");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("appends and attaches the screenshots directly outside a web session", async () => {
		const shot = screenshotFile("crash.png");

		await editIssue("42", {
			repo: "acme/widgets",
			screenshot: [`Crash=${shot}`],
		});

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(stageScreenshots).not.toHaveBeenCalled();
		expect(pushedArgs()).toEqual([
			"issue",
			"edit",
			"42",
			"--body",
			`# History\n\nlots of noise\n\n## Screenshots\n\n![Crash](${shot})`,
			"--repo",
			"acme/widgets",
			"--attach",
			shot,
		]);
	});
});
