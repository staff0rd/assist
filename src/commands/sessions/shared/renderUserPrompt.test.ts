import { describe, expect, it } from "vitest";
import { renderUserPrompt } from "./renderUserPrompt";

function user(
	content: unknown,
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return { type: "user", message: { role: "user", content }, ...overrides };
}

describe("renderUserPrompt", () => {
	it("renders a typed prompt", () => {
		expect(renderUserPrompt(user("  fix it  "))).toBe("fix it");
	});

	it("renders a slash command as its name and arguments", () => {
		const entry = user(
			"<command-message>draft</command-message>\n<command-name>/draft</command-name>\n<command-args>stalls</command-args>",
		);

		expect(renderUserPrompt(entry)).toBe("/draft stalls");
	});

	it.each([
		["sidechain", user("x", { isSidechain: true })],
		["meta", user("x", { isMeta: true })],
		["interrupt", user("[Request interrupted by user]")],
		["task notification", user("x", { origin: { kind: "task-notification" } })],
		["tool result", user([{ type: "tool_result", content: "ok" }])],
		["assistant", { type: "assistant", message: { content: "x" } }],
	])("skips a %s entry", (_label, entry) => {
		expect(renderUserPrompt(entry)).toBeUndefined();
	});

	it("caps a long prompt", () => {
		expect(renderUserPrompt(user("abcdef"), 3)).toBe("abc…");
	});
});
