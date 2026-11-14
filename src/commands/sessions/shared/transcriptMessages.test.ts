import { describe, expect, it } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { codexConversationReader } from "../../../shared/harnessAdapters/codexConversationReader";
import { transcriptMessages } from "./transcriptMessages";

const parseCodexTranscriptLines = (lines: string[]) =>
	transcriptMessages(codexConversationReader, lines);
const parseClaudeTranscriptLines = (lines: string[]) =>
	transcriptMessages(claudeConversationReader, lines);

function line(entry: unknown): string {
	return JSON.stringify(entry);
}

describe("transcriptMessages from a Codex rollout", () => {
	it("reads the conversation from the rollout's event stream", () => {
		const messages = parseCodexTranscriptLines([
			line({ type: "session_meta", payload: { session_id: "c1" } }),
			line({
				type: "event_msg",
				payload: { type: "user_message", message: "what time is it" },
			}),
			line({
				type: "event_msg",
				payload: { type: "agent_message", message: "It is 9pm." },
			}),
		]);

		expect(messages).toEqual([
			{ role: "user", text: "what time is it" },
			{ role: "assistant", text: "It is 9pm." },
		]);
	});

	it("skips the developer instructions replayed as api messages", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "message",
					role: "user",
					content: [{ type: "input_text", text: "# AGENTS.md instructions" }],
				},
			}),
		]);

		expect(messages).toEqual([]);
	});

	it("shows the command a tool call ran", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "function_call",
					name: "exec_command",
					arguments: JSON.stringify({ cmd: "git status", workdir: "/repo" }),
				},
			}),
		]);

		expect(messages).toEqual([
			{ role: "tool", tool: "exec_command", target: "git status" },
		]);
	});

	it("shows the script a custom tool call ran", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "custom_tool_call",
					name: "exec",
					input: "const r = await tools.web__run({});\n",
				},
			}),
		]);

		expect(messages).toEqual([
			{
				role: "tool",
				tool: "exec",
				target: "const r = await tools.web__run({});",
			},
		]);
	});

	it("ignores unparseable and blank lines", () => {
		expect(parseCodexTranscriptLines(["", "not json"])).toEqual([]);
	});
});

describe("transcriptMessages from a Claude transcript", () => {
	it("extracts user and assistant text", () => {
		const messages = parseClaudeTranscriptLines([
			line({ type: "user", message: { role: "user", content: "hello" } }),
			line({
				type: "assistant",
				message: { role: "assistant", content: [{ type: "text", text: "hi" }] },
			}),
		]);
		expect(messages).toEqual([
			{ role: "user", text: "hello" },
			{ role: "assistant", text: "hi" },
		]);
	});

	it("summarizes tool_use as tool name plus a brief target", () => {
		const messages = parseClaudeTranscriptLines([
			line({
				type: "assistant",
				message: {
					content: [
						{
							type: "tool_use",
							name: "Read",
							input: { file_path: "/tmp/a.ts" },
						},
						{ type: "tool_use", name: "Bash", input: { command: "ls -la" } },
					],
				},
			}),
		]);
		expect(messages).toEqual([
			{ role: "tool", tool: "Read", target: "/tmp/a.ts" },
			{ role: "tool", tool: "Bash", target: "ls -la" },
		]);
	});

	it("carries a tool call's description alongside its target", () => {
		const messages = parseClaudeTranscriptLines([
			line({
				type: "assistant",
				message: {
					content: [
						{
							type: "tool_use",
							name: "Bash",
							input: { command: "ls -la", description: "List files" },
						},
					],
				},
			}),
		]);
		expect(messages).toEqual([
			{
				role: "tool",
				tool: "Bash",
				target: "ls -la",
				description: "List files",
			},
		]);
	});

	it("skips tool_result, meta and sidechain entries and renders a slash-command opener", () => {
		const messages = parseClaudeTranscriptLines([
			line({ type: "user", isMeta: true, message: { content: "meta" } }),
			line({
				type: "user",
				isSidechain: true,
				message: { content: "sidechain" },
			}),
			line({
				type: "user",
				message: {
					content: [{ type: "tool_result", content: "big payload" }],
				},
			}),
			line({
				type: "user",
				message: {
					content:
						"<command-name>/refine</command-name><command-args>x</command-args>",
				},
			}),
			line({ type: "user", message: { content: "real text" } }),
		]);
		expect(messages).toEqual([
			{ role: "user", text: "/refine x" },
			{ role: "user", text: "real text" },
		]);
	});

	it("drops assistant thinking blocks but keeps text", () => {
		const messages = parseClaudeTranscriptLines([
			line({
				type: "assistant",
				message: {
					content: [
						{ type: "thinking", thinking: "internal" },
						{ type: "text", text: "answer" },
					],
				},
			}),
		]);
		expect(messages).toEqual([{ role: "assistant", text: "answer" }]);
	});

	it("marks an interrupted turn", () => {
		const messages = parseClaudeTranscriptLines([
			line({
				type: "user",
				message: {
					role: "user",
					content: [
						{
							type: "text",
							text: "[Request interrupted by user for tool use]",
						},
					],
				},
			}),
		]);

		expect(messages).toEqual([{ role: "interrupt" }]);
	});

	it("collapses a tagged restart nudge into a restart marker", () => {
		const nudge =
			'<assist-restart killed="2">The daemon restarted.</assist-restart>';
		const messages = parseClaudeTranscriptLines([
			line({ type: "user", message: { role: "user", content: nudge } }),
			line({
				type: "user",
				message: { role: "user", content: [{ type: "text", text: nudge }] },
			}),
		]);

		expect(messages).toEqual([
			{ role: "restart", killed: 2 },
			{ role: "restart", killed: 2 },
		]);
	});

	it("keeps an untagged restart nudge as a user message", () => {
		const text =
			"A restart interrupted this conversation. Continue from where you left off.";
		const messages = parseClaudeTranscriptLines([
			line({ type: "user", message: { role: "user", content: text } }),
		]);

		expect(messages).toEqual([{ role: "user", text }]);
	});
});
