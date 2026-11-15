import { describe, expect, it } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { transcriptMessages } from "./transcriptMessages";

const delivered =
	'`assist ask-question` finished with exit code 0:\n\nUser has answered your questions: "Which?"="Red, darker". You can now continue.';

function userLine(content: string, timestamp: string): string {
	return JSON.stringify({
		type: "user",
		timestamp,
		message: { role: "user", content },
	});
}

const reply = {
	at: "2026-11-16T10:00:00.000Z",
	command: "ask-question",
	text: "Red, darker",
};

describe("transcriptMessages with pane replies", () => {
	it("shows the reply in place of the delivered deferred result", () => {
		expect(
			transcriptMessages(
				claudeConversationReader,
				[userLine(delivered, "2026-11-16T10:00:01.000Z")],
				[reply],
			),
		).toEqual([{ role: "user", text: "Red, darker", sent: delivered }]);
	});

	it("never inserts a reply as its own row", () => {
		expect(
			transcriptMessages(
				claudeConversationReader,
				[userLine("hello", "2026-11-16T10:00:01.000Z")],
				[reply],
			),
		).toEqual([{ role: "user", text: "hello" }]);
	});

	it("leaves a result delivered before the reply as sent", () => {
		expect(
			transcriptMessages(
				claudeConversationReader,
				[userLine(delivered, "2026-11-16T09:59:59.000Z")],
				[reply],
			),
		).toEqual([{ role: "user", text: delivered }]);
	});

	it("leaves a deferred result without a pane decision as sent", () => {
		const other = "`assist ask-question` finished with exit code 1:\n\nboom";
		expect(
			transcriptMessages(
				claudeConversationReader,
				[
					userLine(delivered, "2026-11-16T10:00:01.000Z"),
					userLine(other, "2026-11-16T10:05:00.000Z"),
				],
				[reply],
			),
		).toEqual([
			{ role: "user", text: "Red, darker", sent: delivered },
			{ role: "user", text: other },
		]);
	});

	it("uses the latest reply when an earlier one was never delivered", () => {
		const stale = { ...reply, at: "2026-11-16T09:00:00.000Z", text: "old" };
		expect(
			transcriptMessages(
				claudeConversationReader,
				[userLine(delivered, "2026-11-16T10:00:01.000Z")],
				[reply, stale],
			),
		).toEqual([{ role: "user", text: "Red, darker", sent: delivered }]);
	});
});
