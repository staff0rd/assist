import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { codexConversationReader } from "../../../shared/harnessAdapters/codexConversationReader";
import type { ConversationReader } from "../../../shared/harnessAdapters/types";

vi.mock("./locateConversation", () => ({ locateConversation: vi.fn() }));

import { locateConversation } from "./locateConversation";
import { resolveSessionTranscript } from "./resolveSessionTranscript";

const SESSION_ID = "991a1fde-669f-43f0-9b30-60892465b411";
const mockLocate = vi.mocked(locateConversation);

function located(reader: ConversationReader, lines: unknown[]) {
	const filePath = join(
		mkdtempSync(join(tmpdir(), "session-transcript-")),
		`${SESSION_ID}.jsonl`,
	);
	writeFileSync(
		filePath,
		`${lines.map((l) => JSON.stringify(l)).join("\n")}\n`,
	);
	mockLocate.mockResolvedValue({ reader, filePath });
	return filePath;
}

const claudeUser = (text: string) => ({
	type: "user",
	sessionId: SESSION_ID,
	message: { content: text },
});

describe("resolveSessionTranscript", () => {
	beforeEach(() => mockLocate.mockReset());

	it("resolves a Claude transcript and names it after the first prompt", async () => {
		const filePath = located(claudeConversationReader, [
			claudeUser("Fix the flaky test"),
		]);

		expect(await resolveSessionTranscript(SESSION_ID)).toEqual({
			path: filePath,
			prompt: "Fix the flaky test",
		});
		expect(mockLocate).toHaveBeenCalledWith(SESSION_ID);
	});

	it("resolves a Codex rollout through its reader", async () => {
		const filePath = located(codexConversationReader, [
			{ type: "session_meta", payload: { id: SESSION_ID } },
			{
				type: "event_msg",
				payload: { type: "user_message", message: "Tidy the README" },
			},
		]);

		expect(await resolveSessionTranscript(SESSION_ID)).toEqual({
			path: filePath,
			prompt: "Tidy the README",
		});
	});

	it("returns undefined when no harness holds the conversation", async () => {
		mockLocate.mockResolvedValue(undefined);
		expect(await resolveSessionTranscript(SESSION_ID)).toBeUndefined();
	});

	it("names a slash-command session after the command and its args", async () => {
		located(claudeConversationReader, [
			claudeUser(
				"<command-message>bug</command-message>\n<command-name>/bug</command-name>\n<command-args>no hyperlink preview on hover</command-args>",
			),
		]);

		expect((await resolveSessionTranscript(SESSION_ID))?.prompt).toBe(
			"/bug no hyperlink preview on hover",
		);
	});

	it("names an argument-free slash-command session after the command", async () => {
		located(claudeConversationReader, [
			claudeUser(
				"<command-name>/verify</command-name><command-args></command-args>",
			),
		]);

		expect((await resolveSessionTranscript(SESSION_ID))?.prompt).toBe(
			"/verify",
		);
	});

	it("caps the prompt at 80 characters", async () => {
		located(claudeConversationReader, [claudeUser("x".repeat(120))]);
		expect((await resolveSessionTranscript(SESSION_ID))?.prompt).toHaveLength(
			80,
		);
	});

	it("omits the prompt a transcript without user messages cannot supply", async () => {
		const filePath = located(claudeConversationReader, [
			{ type: "summary", summary: "no prompts here" },
		]);

		expect(await resolveSessionTranscript(SESSION_ID)).toEqual({
			path: filePath,
			prompt: undefined,
		});
	});
});
