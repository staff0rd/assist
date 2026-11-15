import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";

vi.mock("./locateConversation", () => ({ locateConversation: vi.fn() }));
vi.mock("../daemon/readTranscriptEchoes", () => ({
	readTranscriptEchoes: vi.fn(),
}));

import { readTranscriptEchoes } from "../daemon/readTranscriptEchoes";
import { locateConversation } from "./locateConversation";
import { parseTranscript } from "./parseTranscript";

const ID = "conv-1";
const sent =
	'`assist ask-question` finished with exit code 0:\n\n"Which?"="Red"';

function entry(type: "user" | "assistant", text: string, timestamp: string) {
	return {
		type,
		sessionId: ID,
		timestamp,
		message: {
			role: type,
			content: type === "user" ? text : [{ type: "text", text }],
		},
	};
}

describe("parseTranscript", () => {
	it("shows a recorded pane reply in place of its delivered result", async () => {
		const filePath = join(mkdtempSync(join(tmpdir(), "parse-")), `${ID}.jsonl`);
		writeFileSync(
			filePath,
			[
				entry("user", "start", "2026-11-14T01:00:00.000Z"),
				entry("assistant", "asking", "2026-11-14T01:01:00.000Z"),
				entry("user", sent, "2026-11-14T01:02:30.000Z"),
				entry("assistant", "thanks", "2026-11-14T01:03:00.000Z"),
			]
				.map((e) => JSON.stringify(e))
				.join("\n"),
		);
		vi.mocked(locateConversation).mockResolvedValue({
			reader: claudeConversationReader,
			filePath,
		});
		vi.mocked(readTranscriptEchoes).mockResolvedValue([
			{ at: "2026-11-14T01:02:00.000Z", command: "ask-question", text: "Red" },
		]);
		expect(await parseTranscript(ID)).toEqual([
			{ role: "user", text: "start" },
			{ role: "assistant", text: "asking" },
			{ role: "user", text: "Red", sent },
			{ role: "assistant", text: "thanks" },
		]);
		expect(readTranscriptEchoes).toHaveBeenCalledWith(ID);
	});
});
