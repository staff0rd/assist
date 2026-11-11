import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { claudeConversationReader as reader } from "./claudeConversationReader";

const fixture = (name: string): Record<string, unknown>[] =>
	readFileSync(new URL(`fixtures/${name}`, import.meta.url), "utf8")
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));

const transcript = fixture("claudeTranscript.jsonl");
const excluded = fixture("claudeExcluded.jsonl");
const askedAt = transcript.findIndex(
	(entry) =>
		JSON.stringify(entry).includes('"name":"AskUserQuestion"') &&
		entry.type === "assistant",
);
const answeredTurn = transcript.findIndex(
	(entry) =>
		entry.type === "assistant" &&
		(entry.message as { content: { type: string }[] }).content[0].type ===
			"text",
);

describe("claudeConversationReader", () => {
	it("normalizes a captured session's prompts, replies, tool calls and results", () => {
		const events = reader.events(transcript);
		expect(events.map(({ kind }) => kind)).toEqual([
			"message",
			"tool",
			"toolResult",
			"message",
			"tool",
			"toolResult",
			"tool",
			"toolResult",
		]);
		expect(events[0]).toEqual({
			kind: "message",
			role: "user",
			text: "/refine a1339",
			at: "2026-10-30T11:32:31.287Z",
		});
		expect(events[1]).toMatchObject({
			kind: "tool",
			tool: "Bash",
			operations: [{ kind: "command", tool: "Bash" }],
		});
		expect(events[3]).toMatchObject({ kind: "message", role: "assistant" });
		expect(events[4]).toMatchObject({
			tool: "AskUserQuestion",
			operations: [{ kind: "question" }],
		});
		expect(events[6]).toMatchObject({
			tool: "Edit",
			target: expect.stringMatching(/assist-phone\.html$/),
			operations: [
				{
					kind: "fileWrite",
					path: expect.stringMatching(/assist-phone\.html$/),
				},
			],
		});
	});

	it("excludes captured replayed system content, meta, sidechain, interrupts, task notifications and failed results", () => {
		expect(excluded.length).toBeGreaterThan(0);
		expect(reader.events(excluded)).toEqual([]);
	});

	it("reports a pending question as asking and a finished turn as waiting", () => {
		expect(reader.lifecycle(transcript.slice(0, askedAt + 1))).toEqual({
			status: "waiting",
			asking: true,
		});
		expect(reader.lifecycle(transcript.slice(0, answeredTurn + 1))).toEqual({
			status: "waiting",
			asking: false,
		});
		expect(reader.lifecycle(transcript.slice(0, 9)).status).toBe("running");
	});

	it("changes its fingerprint as the transcript grows", () => {
		const first = reader.fingerprint(transcript.slice(0, answeredTurn));
		expect(reader.fingerprint(transcript.slice(0, answeredTurn + 1))).not.toBe(
			first,
		);
	});

	it("recognises every entry shape in captured sessions", () => {
		expect(reader.unrecognised?.([...transcript, ...excluded])).toEqual([]);
	});

	it("reports unknown entry types and content blocks once each", () => {
		const [prompt] = transcript.filter((entry) => entry.type === "user");
		expect(
			reader.unrecognised?.([
				...transcript,
				{ type: "hologram", timestamp: "2026-11-10T00:00:00.000Z" },
				{ type: "hologram" },
				{
					...prompt,
					message: { role: "user", content: [{ type: "video" }] },
				},
				{ type: "assistant", message: { content: { type: "text" } } },
			]),
		).toEqual(["hologram", "user/video", "assistant/content"]);
	});

	it("binds to the claude session id under the cwd's project dir", () => {
		expect(
			reader.watchTarget({ cwd: "/repo", claudeSessionId: "abc" })?.file,
		).toBe("abc.jsonl");
		expect(
			reader.watchTarget({ cwd: "/repo", harnessSessionId: "x" }),
		).toBeNull();
	});
});
