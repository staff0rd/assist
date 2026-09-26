import { describe, expect, it } from "vitest";
import { extractUserMessages } from "./extractUserMessages";

function user(
	content: unknown,
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return { type: "user", message: { role: "user", content }, ...overrides };
}

describe("extractUserMessages", () => {
	it("returns nothing when no prompt was typed", () => {
		expect(
			extractUserMessages([{ type: "assistant", message: { content: "hi" } }]),
		).toEqual([]);
	});

	it("returns every typed prompt oldest first, skipping filtered entries", () => {
		const entries = [
			user("first"),
			{
				type: "assistant",
				message: { content: [{ type: "text", text: "ok" }] },
			},
			user("side", { isSidechain: true }),
			user("meta", { isMeta: true }),
			user([{ type: "tool_result", tool_use_id: "t1", content: "ok" }]),
			user("[Request interrupted by user]"),
			user("done", { origin: { kind: "task-notification" } }),
			user(
				"<command-message>verify</command-message>\n<command-name>/verify</command-name>\n<command-args></command-args>",
			),
			user([{ type: "text", text: "last" }]),
		];

		expect(extractUserMessages(entries)).toEqual(["first", "/verify", "last"]);
	});
});
