import { describe, expect, it } from "vitest";
import { lastMessageText } from "./lastMessageText";

describe("lastMessageText", () => {
	it("previews a session message by its body, not the raw tag", () => {
		expect(
			lastMessageText(
				[
					{
						kind: "message",
						role: "user",
						text: '<session-message from="2" agent="yoke-2-e6">run hash -r</session-message>',
					},
				],
				"user",
				100,
			),
		).toBe("run hash -r");
	});
});
