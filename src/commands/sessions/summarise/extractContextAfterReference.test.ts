import { closeSync, openSync, readSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../test/mocks/fsMock";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);

import { extractContextAfterReference } from "./extractContextAfterReference";

const mockOpenSync = vi.mocked(openSync);
const mockReadSync = vi.mocked(readSync);
const mockCloseSync = vi.mocked(closeSync);

const JIRA_URL = "https://centium.atlassian.net/browse/PA-556";

const ISSUE_BODY =
	'The bullet list under the "## Nonsense" heading in README.md is in ' +
	"arbitrary order and has become hard to scan as it grows. Reorder the five " +
	"bullets so they read alphabetically by their first word.";

const AGENT_SUMMARY =
	"PA-556 reports that saving a client record silently drops the contact " +
	"email when the form is submitted twice. The fix likely belongs in the " +
	"save handler.";

function userLine(text: string): string {
	return JSON.stringify({
		type: "user",
		message: { role: "user", content: text },
	});
}

function assistantLine(text: string): string {
	return JSON.stringify({
		type: "assistant",
		message: { role: "assistant", content: [{ type: "text", text }] },
	});
}

function toolResultLine(
	content: unknown = "a very long tool payload",
	isError = false,
): string {
	return JSON.stringify({
		type: "user",
		message: {
			role: "user",
			content: [{ type: "tool_result", content, is_error: isError }],
		},
	});
}

function toolUseLine(): string {
	return JSON.stringify({
		type: "assistant",
		message: {
			role: "assistant",
			content: [
				{ type: "tool_use", name: "getJiraIssue", input: { issue: "PA-556" } },
			],
		},
	});
}

function mockFileContent(lines: string[]) {
	mockOpenSync.mockReturnValue(42);
	mockReadSync.mockImplementation((_fd, buf) => {
		const bytes = Buffer.from(lines.join("\n"), "utf8");
		bytes.copy(buf as Buffer);
		return bytes.length;
	});
}

describe("extractContextAfterReference", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns nothing when the file cannot be read", () => {
		mockOpenSync.mockImplementation(() => {
			throw new Error("ENOENT");
		});

		expect(extractContextAfterReference("/missing.jsonl")).toBeUndefined();
	});

	it("returns nothing when the transcript holds only the reference", () => {
		mockFileContent([userLine(JIRA_URL)]);

		expect(extractContextAfterReference("/s.jsonl")).toBeUndefined();
	});

	it("returns nothing while the context is still too thin to summarise", () => {
		mockFileContent([
			userLine(JIRA_URL),
			assistantLine("Let me look at that."),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBeUndefined();
	});

	it("summarises the context that follows the reference, not the reference", () => {
		mockFileContent([
			userLine(JIRA_URL),
			toolUseLine(),
			toolResultLine(),
			assistantLine(AGENT_SUMMARY),
		]);

		const context = extractContextAfterReference("/s.jsonl");

		expect(context).toContain(AGENT_SUMMARY);
		expect(context).not.toContain(JIRA_URL);
	});

	it("counts the fetched reference even when it only lands in a tool result", () => {
		mockFileContent([
			userLine(JIRA_URL),
			assistantLine("I'll fetch that."),
			toolUseLine(),
			toolResultLine(ISSUE_BODY),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toContain(ISSUE_BODY);
	});

	it("reads a tool result delivered as content blocks", () => {
		mockFileContent([
			userLine(JIRA_URL),
			toolUseLine(),
			toolResultLine([{ type: "text", text: ISSUE_BODY }]),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toContain(ISSUE_BODY);
	});

	it("ignores failed tool calls", () => {
		mockFileContent([
			userLine(JIRA_URL),
			toolUseLine(),
			toolResultLine(`${ISSUE_BODY} but it failed`, true),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBeUndefined();
	});

	it("keeps prose that shares the opening message with a reference", () => {
		mockFileContent([
			userLine(`${JIRA_URL} ${AGENT_SUMMARY}`),
			assistantLine("On it."),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toContain(AGENT_SUMMARY);
	});

	it("joins several turns of context together", () => {
		mockFileContent([
			userLine("PA-556"),
			assistantLine("What triggers the failure?"),
			userLine("Saving a client record twice loses the contact email"),
			assistantLine(
				"Understood, I will file that as a bug for the save handler",
			),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(
			[
				"What triggers the failure?",
				"Saving a client record twice loses the contact email",
				"Understood, I will file that as a bug for the save handler",
			].join("\n"),
		);
	});

	it("skips sidechain and meta entries", () => {
		mockFileContent([
			userLine(JIRA_URL),
			JSON.stringify({
				type: "assistant",
				isSidechain: true,
				message: {
					role: "assistant",
					content: [{ type: "text", text: "x".repeat(200) }],
				},
			}),
			JSON.stringify({
				type: "user",
				isMeta: true,
				message: { role: "user", content: "y".repeat(200) },
			}),
			assistantLine(AGENT_SUMMARY),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(AGENT_SUMMARY);
	});

	it("skips malformed lines", () => {
		mockFileContent([
			userLine(JIRA_URL),
			"not json",
			assistantLine(AGENT_SUMMARY),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(AGENT_SUMMARY);
	});

	it("caps the context it hands to the summariser", () => {
		mockFileContent([userLine(JIRA_URL), assistantLine("z".repeat(2000))]);

		expect(extractContextAfterReference("/s.jsonl")).toHaveLength(800);
	});

	it("titles a draft card that has only fetched its github issue", () => {
		const skillPrompt =
			"You are helping the user create a backlog item with a phased implementation plan. ".repeat(
				20,
			);
		mockFileContent([
			userLine(
				"<command-message>draft</command-message>\n" +
					"<command-name>/draft</command-name>\n" +
					"<command-args>https://github.com/staff0rd/sandbox/issues/8</command-args>",
			),
			JSON.stringify({
				type: "user",
				isMeta: true,
				message: {
					role: "user",
					content: [{ type: "text", text: skillPrompt }],
				},
			}),
			assistantLine("I'll start by fetching the GitHub issue."),
			toolUseLine(),
			toolResultLine(
				JSON.stringify({
					body: ISSUE_BODY,
					number: 8,
					title: "Sort the Nonsense bullet list alphabetically",
				}),
			),
		]);

		const context = extractContextAfterReference("/s.jsonl");

		expect(context).toContain("Reorder the five bullets");
		expect(context).toContain("Sort the Nonsense bullet list alphabetically");
		expect(context).not.toContain("phased implementation plan");
	});

	it("closes the file descriptor", () => {
		mockFileContent([userLine(JIRA_URL), assistantLine(AGENT_SUMMARY)]);

		extractContextAfterReference("/s.jsonl");

		expect(mockCloseSync).toHaveBeenCalledWith(42);
	});
});
