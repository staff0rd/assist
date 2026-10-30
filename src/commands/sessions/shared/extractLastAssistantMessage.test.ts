import { describe, expect, it } from "vitest";
import { extractLastAssistantMessage } from "./extractLastAssistantMessage";

function assistant(
	content: unknown[],
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return { type: "assistant", message: { content }, ...overrides };
}

const text = (t: string) => ({ type: "text", text: t });
const toolUse = { type: "tool_use", id: "t1", name: "Bash", input: {} };

describe("extractLastAssistantMessage", () => {
	it("returns nothing without assistant text", () => {
		expect(
			extractLastAssistantMessage([
				{ type: "user", message: { content: "hi" } },
				assistant([toolUse]),
			]),
		).toBeUndefined();
	});

	it("returns the newest assistant text, skipping tool-only turns", () => {
		const entries = [
			assistant([text("first")]),
			assistant([text("  Ready to commit?  ")]),
			assistant([toolUse]),
		];

		expect(extractLastAssistantMessage(entries)).toBe("Ready to commit?");
	});

	it("ignores sidechain entries", () => {
		const entries = [
			assistant([text("main")]),
			assistant([text("subagent")], { isSidechain: true }),
		];

		expect(extractLastAssistantMessage(entries)).toBe("main");
	});

	it("caps long messages", () => {
		const result = extractLastAssistantMessage([
			assistant([text("x".repeat(600))]),
		]);

		expect(result).toHaveLength(501);
		expect(result?.endsWith("…")).toBe(true);
	});
});
