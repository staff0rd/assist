import { describe, expect, it } from "vitest";
import { codexConversationReader as reader } from "./codexConversationReader";

const at = "2026-11-10T00:00:00.000Z";
const meta = {
	type: "session_meta",
	payload: { id: "conv-1", cwd: "/repo", timestamp: at },
};
const event = (payload: Record<string, unknown>) => ({
	timestamp: at,
	type: "event_msg",
	payload,
});
const item = (payload: Record<string, unknown>) => ({
	timestamp: at,
	type: "response_item",
	payload,
});
const developerAdvice = item({
	type: "message",
	role: "developer",
	content: [
		{
			type: "input_text",
			text: "# Instructions for this repo (composed by assist)\n\n...",
		},
	],
});
const environment = item({
	type: "message",
	role: "user",
	content: [{ type: "input_text", text: "<environment_context>…" }],
});
const userItem = (text: string) =>
	event({
		type: "item_completed",
		item: { type: "UserMessage", content: [{ type: "text", text }] },
	});
const agentItem = (text: string) =>
	event({
		type: "item_completed",
		item: { type: "AgentMessage", content: [{ type: "Text", text }] },
	});
const shell = item({
	type: "function_call",
	name: "shell",
	call_id: "c1",
	arguments: JSON.stringify({ command: ["bash", "-lc", "git status"] }),
});
const patch = item({
	type: "custom_tool_call",
	name: "apply_patch",
	call_id: "c2",
	input: "*** Begin Patch\n*** Add File: a.txt\n+hi\n*** End Patch",
});
const output = item({
	type: "function_call_output",
	call_id: "c1",
	output: "On branch main",
});

describe("codexConversationReader", () => {
	it("normalizes current item_completed messages, tools and results", () => {
		expect(
			reader.events([
				meta,
				event({ type: "task_started" }),
				developerAdvice,
				environment,
				userItem("fix the login page"),
				agentItem("Looking now."),
				shell,
				output,
				patch,
			]),
		).toEqual([
			{ kind: "message", role: "user", text: "fix the login page", at },
			{ kind: "message", role: "assistant", text: "Looking now.", at },
			{
				kind: "tool",
				tool: "shell",
				target: "bash -lc git status",
				operations: [
					{ kind: "command", tool: "Bash", command: "bash -lc git status" },
				],
				at,
			},
			{ kind: "toolResult", text: "On branch main", at },
			expect.objectContaining({
				kind: "tool",
				tool: "apply_patch",
				operations: [
					expect.objectContaining({ kind: "fileWrite", path: "a.txt" }),
				],
			}),
		]);
	});

	it("reads the legacy user_message/agent_message events", () => {
		expect(
			reader.events([
				event({ type: "user_message", message: "hello" }),
				event({ type: "agent_message", message: "hi" }),
			]),
		).toEqual([
			{ kind: "message", role: "user", text: "hello", at },
			{ kind: "message", role: "assistant", text: "hi", at },
		]);
	});

	it("excludes replayed system and advice content posing as user messages", () => {
		expect(
			reader.events([
				event({ type: "user_message", message: "<environment_context>x" }),
				userItem("# AGENTS.md instructions for /repo\n..."),
				userItem("# Instructions for this repo (composed by assist)\n..."),
				userItem("   "),
			]),
		).toEqual([]);
	});

	it("derives lifecycle from turn events and stays undecided for an empty rollout", () => {
		expect(reader.lifecycle([meta]).status).toBeNull();
		expect(
			reader.lifecycle([meta, event({ type: "task_started" }), shell]).status,
		).toBe("running");
		expect(
			reader.lifecycle([
				event({ type: "task_started" }),
				event({ type: "task_complete" }),
			]),
		).toEqual({ status: "waiting", asking: false });
	});

	it("changes its fingerprint as the rollout grows", () => {
		const first = reader.fingerprint([meta, userItem("go")]);
		const grown = reader.fingerprint([meta, userItem("go"), shell]);
		expect(first).not.toBeNull();
		expect(grown).not.toBe(first);
		expect(reader.fingerprint([meta])).toBeNull();
	});

	it("locates nothing until a conversation id is bound", () => {
		expect(reader.locate({ cwd: "/repo", claudeSessionId: "x" })).toBeNull();
		expect(reader.watchTarget({ cwd: "/repo" })).toBeNull();
	});
});
