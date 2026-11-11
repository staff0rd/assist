import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { codexConversationReader as reader } from "./codexConversationReader";

type Entry = Record<string, unknown> & { payload?: Record<string, unknown> };

const fixture = (name: string): Entry[] =>
	readFileSync(new URL(`fixtures/${name}`, import.meta.url), "utf8")
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));

const rollout = fixture("codexRollout.jsonl");
const legacy = fixture("codexLegacyRollout.jsonl");
const payloadType = (entry: Entry) => entry.payload?.type;
const itemType = (entry: Entry) =>
	(entry.payload?.item as { type?: string } | undefined)?.type;
const userItem = rollout.find((entry) => itemType(entry) === "UserMessage");
const userMessage = legacy.find(
	(entry) => payloadType(entry) === "user_message",
);
const meta = rollout[0];
const taskStarted = rollout.findIndex(
	(entry) => payloadType(entry) === "task_started",
);
const firstTool = rollout.findIndex(
	(entry) => payloadType(entry) === "custom_tool_call",
);

function withUserText(text: string): Entry[] {
	if (!userItem || !userMessage) throw new Error("fixture lacks user entries");
	const item = userItem.payload?.item as Record<string, unknown>;
	return [
		{ ...userMessage, payload: { ...userMessage.payload, message: text } },
		{
			...userItem,
			payload: {
				...userItem.payload,
				item: { ...item, content: [{ type: "text", text }] },
			},
		},
	];
}

describe("codexConversationReader", () => {
	it("normalizes a captured current rollout's messages, tools, writes and results", () => {
		const events = reader.events(rollout);
		expect(events.map(({ kind }) => kind)).toEqual([
			"message",
			"message",
			"tool",
			"tool",
			"toolResult",
			"toolResult",
			"message",
		]);
		expect(events[0]).toEqual({
			kind: "message",
			role: "user",
			text: "Use the apply_patch tool to create a file hello.txt containing hi. Then run: echo done && ls",
			at: "2026-11-09T12:56:43.668Z",
		});
		expect(events[1]).toMatchObject({ role: "assistant" });
		expect(events[3]).toMatchObject({
			tool: "apply_patch",
			operations: [
				{
					kind: "fileWrite",
					path: "/home/dev/git/assist-3/hello.txt",
					contents: ["hi\n"],
				},
			],
		});
		expect(events[4]).toMatchObject({
			text: expect.stringMatching(/^done\n/),
		});
		expect(events[6]).toMatchObject({
			role: "assistant",
			text: expect.stringMatching(/^Created \[hello\.txt\]/),
		});
	});

	it("reads a captured legacy rollout's user_message/agent_message events and shell calls", () => {
		const events = reader.events(legacy);
		expect(events.slice(0, 4)).toEqual([
			expect.objectContaining({
				kind: "message",
				role: "user",
				text: expect.stringMatching(/^You are acting as a reviewer/),
			}),
			expect.objectContaining({ kind: "message", role: "assistant" }),
			expect.objectContaining({
				kind: "tool",
				tool: "exec_command",
				target: "sed -n '1,240p' request.md",
				operations: [
					{
						kind: "command",
						tool: "Bash",
						command: "sed -n '1,240p' request.md",
					},
				],
			}),
			expect.objectContaining({
				kind: "toolResult",
				text: expect.stringMatching(/^Chunk ID/),
			}),
		]);
	});

	it("excludes replayed system and advice content posing as user messages", () => {
		expect(
			reader.events([
				...withUserText("<environment_context>x"),
				...withUserText("# AGENTS.md instructions for /repo\n..."),
				...withUserText(
					"# Instructions for this repo (composed by assist)\n...",
				),
				...withUserText("   "),
			]),
		).toEqual([]);
	});

	it("derives lifecycle from turn events and stays undecided for an empty rollout", () => {
		expect(reader.lifecycle([meta]).status).toBeNull();
		expect(
			reader.lifecycle([meta, rollout[taskStarted], rollout[firstTool]]).status,
		).toBe("running");
		expect(reader.lifecycle(rollout)).toEqual({
			status: "waiting",
			asking: false,
		});
	});

	it("changes its fingerprint as the rollout grows", () => {
		const first = reader.fingerprint(rollout.slice(0, firstTool));
		const grown = reader.fingerprint(rollout.slice(0, firstTool + 1));
		expect(first).not.toBeNull();
		expect(grown).not.toBe(first);
		expect(reader.fingerprint([meta])).toBeNull();
	});

	it("recognises every entry shape in captured rollouts", () => {
		expect(reader.unrecognised?.([...rollout, ...legacy])).toEqual([]);
	});

	it("reports unknown entry, payload and completed item types once each", () => {
		const completed = rollout.find(
			(entry) => itemType(entry) === "AgentMessage",
		) as Entry;
		expect(
			reader.unrecognised?.([
				...rollout,
				{ type: "snapshot" },
				{ type: "snapshot" },
				{ type: "event_msg", payload: { type: "plan_update" } },
				{ type: "response_item", payload: { type: "web_search_call" } },
				{
					...completed,
					payload: { ...completed.payload, item: { type: "WebSearch" } },
				},
			]),
		).toEqual([
			"snapshot",
			"event_msg:plan_update",
			"response_item:web_search_call",
			"event_msg:item_completed:WebSearch",
		]);
	});

	it("locates nothing until a conversation id is bound", () => {
		expect(reader.locate({ cwd: "/repo", claudeSessionId: "x" })).toBeNull();
		expect(reader.watchTarget({ cwd: "/repo" })).toBeNull();
	});
});
