import { describe, expect, it } from "vitest";
import { unseenPendingTexts } from "./unseenPendingTexts";

const nudge =
	'<assist-restart killed="1">The daemon restarted.</assist-restart>';

describe("unseenPendingTexts", () => {
	it("keeps a tagged nudge until the transcript records its restart row", () => {
		const earlier = [
			{ role: "user", text: "earlier ask" },
			{ role: "assistant", text: "earlier reply" },
		];
		expect(unseenPendingTexts([nudge], earlier)).toEqual([nudge]);
		expect(
			unseenPendingTexts([nudge], [...earlier, { role: "restart" }]),
		).toEqual([]);
	});

	it("drops a tagged nudge and a message sent after it once both are recorded", () => {
		expect(
			unseenPendingTexts(
				[nudge, "next ask"],
				[{ role: "restart" }, { role: "user", text: "next ask" }],
			),
		).toEqual([]);
	});

	it("does not match a restart row from before the latest user exchange", () => {
		expect(
			unseenPendingTexts(
				[nudge],
				[
					{ role: "restart" },
					{ role: "assistant", text: "resumed" },
					{ role: "user", text: "later ask" },
					{ role: "assistant", text: "later reply" },
				],
			),
		).toEqual([nudge]);
	});

	it("matches a message sent with shell results by its own text", () => {
		const sent =
			"<bash-input>ls</bash-input>\n<bash-stdout>a</bash-stdout><bash-stderr></bash-stderr>\n\nlook at a";
		expect(
			unseenPendingTexts(
				[sent],
				[{ role: "shell" }, { role: "user", text: "look at a" }],
			),
		).toEqual([]);
	});
});
