import { execFileSync as execFileSyncFn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

const execFileSync = vi.mocked(execFileSyncFn);
const mockRequestPreviewDecision = vi.fn();
const runGhGraphqlJson = vi.fn();

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("../../prs/shared", () => ({
	getRepoInfo: () => ({ org: "acme", repo: "widgets" }),
}));
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (...args: unknown[]) => runGhGraphqlJson(...args),
}));

import { editIssue } from "./editIssue";

const FETCHED_AT = "2026-08-01T00:00:00Z";
let storeDir: string;

function issueJson(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({
		title: "Tidy the history",
		body: "# History\n\nlots of noise",
		updatedAt: FETCHED_AT,
		url: "https://github.com/acme/widgets/issues/42",
		parent: {
			number: 7,
			url: "https://github.com/acme/widgets/issues/7",
		},
		issueType: { name: "Subtask" },
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

function graphqlReply(query: string, variables?: Record<string, unknown>) {
	if (query.includes("issueTypes(")) {
		return JSON.stringify({
			data: {
				organization: {
					issueTypes: {
						nodes: [
							{ id: "IT_epic", name: "Epic" },
							{ id: "IT_story", name: "Story" },
							{ id: "IT_subtask", name: "Subtask" },
						],
					},
				},
			},
		});
	}
	if (query.includes("issue(number:")) {
		const id = variables?.number === 42 ? "I_child" : "I_parent";
		return JSON.stringify({ data: { repository: { issue: { id } } } });
	}
	return JSON.stringify({ data: { addSubIssue: { subIssue: { id: "x" } } } });
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

function ghCalls(verb: string) {
	return execFileSync.mock.calls.filter((call) => call[1]?.[1] === verb);
}

function graphqlCalls(mutation: string) {
	return runGhGraphqlJson.mock.calls.filter((call) =>
		String(call[0]).includes(mutation),
	);
}

function typeCalls() {
	return graphqlCalls("updateIssueIssueType");
}

function workingBodyPath(): string {
	return join(storeDir, "github-issues", "acme", "widgets", "42.md");
}

beforeEach(() => {
	execFileSync.mockReset();
	mockRequestPreviewDecision.mockReset();
	runGhGraphqlJson.mockReset();
	runGhGraphqlJson.mockImplementation(graphqlReply);
	storeDir = mkdtempSync(join(tmpdir(), "assist-issue-type-"));
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

const combined = {
	title: "Tidy the changelog",
	body: "# New",
	parent: "acme/widgets#83",
	type: "story",
};

describe("editIssue --type preview", () => {
	it("previews the title, Type and Parent old → new and the proposed body together", async () => {
		webSession();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", combined);

		expect(mockRequestPreviewDecision).toHaveBeenCalledTimes(1);
		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Edit acme/widgets#42: Tidy the history → Tidy the changelog",
				body: "# New",
				metadata: [
					{ label: "Type", value: "Subtask → Story" },
					{
						label: "Parent",
						value: "acme/widgets#7 → acme/widgets#83",
						url: "https://github.com/acme/widgets/issues/83",
					},
				],
			}),
		);
		expect(ghCalls("view")[0][1]).toContain(
			"title,body,updatedAt,url,parent,issueType",
		);
	});

	it("applies the title, body, type and parent on one approval and reports each", async () => {
		webSession();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", combined);

		expect(ghCalls("edit").map((call) => call[1])).toEqual([
			[
				"issue",
				"edit",
				"42",
				"--body-file",
				workingBodyPath(),
				"--title",
				"Tidy the changelog",
			],
		]);
		expect(typeCalls()).toEqual([
			[expect.any(String), { issueId: "I_child", issueTypeId: "IT_story" }],
		]);
		expect(graphqlCalls("addSubIssue")).toHaveLength(1);
		const output = logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
		expect(output).toContain(
			"Issue renamed and body updated on acme/widgets#42",
		);
		expect(output).toContain("acme/widgets#42 is now a Story");
		expect(output).toContain(
			"acme/widgets#42 is now a sub-issue of acme/widgets#83",
		);
	});

	it("previews --type alone with none as the old type and sets only the type on approval", async () => {
		webSession();
		ghViewReturns(issueJson({ issueType: null }));
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await editIssue("42", { type: "Story" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledTimes(1);
		expect(mockRequestPreviewDecision.mock.calls[0][0].metadata).toEqual([
			{ label: "Type", value: "none → Story" },
		]);
		expect(ghCalls("view")[0][1]).toContain(
			"title,body,updatedAt,url,issueType",
		);
		expect(ghCalls("edit")).toEqual([]);
		expect(typeCalls()).toHaveLength(1);
		expect(graphqlCalls("addSubIssue")).toEqual([]);
	});

	it("pushes nothing, including the type and parent, when the preview is rejected", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "reject" });

		await expect(editIssue("42", combined)).rejects.toThrow("process.exit");

		expect(ghCalls("edit")).toEqual([]);
		expect(typeCalls()).toEqual([]);
		expect(graphqlCalls("addSubIssue")).toEqual([]);
	});

	it("pushes nothing, including the type, when the issue moved after it was fetched", async () => {
		webSession();
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		ghViewReturns(
			issueJson(),
			issueJson({ updatedAt: "2026-08-02T09:30:00Z" }),
		);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await expect(editIssue("42", combined)).rejects.toThrow("process.exit");

		expect(ghCalls("edit")).toEqual([]);
		expect(typeCalls()).toEqual([]);
	});

	it("fails before previewing when the type is unknown, listing the valid types", async () => {
		webSession();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssue("42", { ...combined, type: "Feature" }),
		).rejects.toThrow("process.exit");

		expect(errorSpy).toHaveBeenCalledWith(
			"Setting the issue type of acme/widgets#42 failed: The organisation has no Feature issue type. It has Epic, Story, Subtask",
		);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("applies the title and type directly outside a web session", async () => {
		await editIssue("42", { title: "Tidy the changelog", type: "Story" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(ghCalls("edit").map((call) => call[1])).toEqual([
			["issue", "edit", "42", "--title", "Tidy the changelog"],
		]);
		expect(typeCalls()).toHaveLength(1);
	});

	it("applies the type alone directly outside a web session", async () => {
		await editIssue("42", { type: "Story" });

		expect(ghCalls("edit")).toEqual([]);
		expect(ghCalls("view")).toEqual([]);
		expect(typeCalls()).toHaveLength(1);
	});

	it("prints the usage when --fetch is combined with --type", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			editIssue("42", { fetch: true, type: "Story" }),
		).rejects.toThrow("process.exit");

		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
		expect(typeCalls()).toEqual([]);
	});
});
