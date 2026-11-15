import { describe, expect, it } from "vitest";
import { claudeUserMessages } from "./claudeUserMessages";

async function* texts() {
	yield "first";
}

describe("claudeUserMessages", () => {
	it("wraps each text as a top-level user turn", async () => {
		const messages = [];
		for await (const message of claudeUserMessages(texts()))
			messages.push(message);
		expect(messages).toEqual([
			{
				type: "user",
				message: { role: "user", content: "first" },
				parent_tool_use_id: null,
			},
		]);
	});
});
