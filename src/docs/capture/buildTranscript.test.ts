import { describe, expect, it } from "vitest";
import { extractSessionMeta } from "../../commands/sessions/shared/extractSessionMeta";
import { buildTranscript, claudeProjectDirName } from "./buildTranscript";

const input = {
	cwd: "/tmp/assist-docs-x/repos/sandbox",
	prompt: "Add a dark mode toggle",
	reply: ["Added the toggle.", "Bash(npm test)"],
	startedAt: new Date("2026-01-02T03:04:05.000Z"),
};

function lines(jsonl: string) {
	return jsonl.trimEnd().split("\n");
}

describe("buildTranscript", () => {
	it("writes a transcript the history parser reads back", () => {
		const { sessionId, jsonl } = buildTranscript(input);
		expect(extractSessionMeta(lines(jsonl))).toEqual({
			sessionId,
			cwd: input.cwd,
			timestamp: "2026-01-02T03:04:05.000Z",
			name: "Add a dark mode toggle",
			commandName: "",
			commandArgs: "",
			reachedFirstPrompt: true,
		});
	});

	it("chains one assistant entry per reply line after the prompt", () => {
		const entries = lines(buildTranscript(input).jsonl).map((line) =>
			JSON.parse(line),
		);
		expect(entries.map((e) => e.type)).toEqual([
			"user",
			"assistant",
			"assistant",
		]);
		expect(entries[1].parentUuid).toBe(entries[0].uuid);
		expect(entries[2].parentUuid).toBe(entries[1].uuid);
		expect(entries[2].message.content).toEqual([
			{ type: "text", text: "Bash(npm test)" },
		]);
	});

	it("derives a stable session id per repo and prompt", () => {
		const { sessionId } = buildTranscript(input);
		expect(sessionId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/,
		);
		expect(buildTranscript(input).sessionId).toBe(sessionId);
		expect(buildTranscript({ ...input, prompt: "Other" }).sessionId).not.toBe(
			sessionId,
		);
	});
});

describe("claudeProjectDirName", () => {
	it("encodes the cwd the way Claude names its project dirs", () => {
		expect(claudeProjectDirName("/tmp/assist-docs-x/repos/sandbox")).toBe(
			"-tmp-assist-docs-x-repos-sandbox",
		);
	});
});
