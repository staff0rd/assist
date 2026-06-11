import { describe, expect, it } from "vitest";
import { parseTranscriptLines } from "./parseTranscript";

function line(obj: unknown): string {
	return JSON.stringify(obj);
}

describe("parseTranscriptLines", () => {
	it("extracts user and assistant text", () => {
		const messages = parseTranscriptLines([
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
		const messages = parseTranscriptLines([
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

	it("skips tool_result, meta, sidechain, and empty command-only messages", () => {
		const messages = parseTranscriptLines([
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
		expect(messages).toEqual([{ role: "user", text: "real text" }]);
	});

	it("drops assistant thinking blocks but keeps text", () => {
		const messages = parseTranscriptLines([
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
});
