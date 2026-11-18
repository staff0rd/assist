import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { clearSeenSdkPending } from "./clearSeenSdkPending";
import type { Session } from "./createSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const entries: Record<string, unknown>[] = readFileSync(
	new URL(
		"../../../shared/harnessAdapters/fixtures/claudeQueuedCommand.jsonl",
		import.meta.url,
	),
	"utf8",
)
	.split("\n")
	.filter(Boolean)
	.map((line) => JSON.parse(line));

const absorbedAt = entries.findIndex(
	(entry) =>
		(entry.attachment as { commandMode?: string } | undefined)?.commandMode ===
		"prompt",
);

const eventsThroughAbsorbedTurn = () =>
	claudeConversationReader.events(entries.slice(0, absorbedAt + 2));

describe("clearSeenSdkPending", () => {
	it("clears a flushed pending entry once its queued_command attachment is in the transcript", () => {
		const notify = vi.fn();
		const session = {
			id: "6",
			sdkPending: [
				"gimme url\n\nalso /draft a market explorer so i can check buy/sell prices myslf",
			],
		} as Session;
		clearSeenSdkPending(session, eventsThroughAbsorbedTurn(), notify);
		expect(session.sdkPending).toBeUndefined();
		expect(notify).toHaveBeenCalledOnce();
	});

	it("keeps the pending entry while only the hook and tool rows are written", () => {
		const session = { id: "6", sdkPending: ["gimme url"] } as Session;
		clearSeenSdkPending(
			session,
			claudeConversationReader.events(entries.slice(0, absorbedAt)),
		);
		expect(session.sdkPending).toEqual(["gimme url"]);
	});
});
