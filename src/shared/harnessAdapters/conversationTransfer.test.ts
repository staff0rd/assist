import { describe, expect, it } from "vitest";
import type { HarnessKind } from "../harnesses";
import { harnessAdapter } from "./harnessAdapter";
import { harnessCapability } from "./harnessCapability";

const kinds: HarnessKind[] = [
	"claude",
	"claude-sdk",
	"codex",
	"codex-sdk",
	"pi",
];

describe("conversation.transfer", () => {
	it.each(kinds)(
		"%s declares transfer only when it can carry and resume a conversation",
		(kind) => {
			const declared = harnessCapability(
				kind,
				"conversation.transfer",
			).supported;
			const conversation = harnessAdapter(kind).conversation;
			const able =
				harnessCapability(kind, "conversation.resume").supported &&
				harnessCapability(kind, "conversation.relocate").supported &&
				conversation.exportTranscript !== undefined &&
				conversation.importTranscript !== undefined;
			expect(declared).toBe(able);
		},
	);

	it("refuses pi with the reason shown on its Transfer button", () => {
		expect(harnessCapability("pi", "conversation.transfer")).toMatchObject({
			supported: false,
			reason: "Pi can't resume a conversation on another node",
		});
	});
});
