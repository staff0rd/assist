import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { findCodexRolloutPathSync } from "../shared/codex/findCodexRolloutPathSync";
import type { SessionClient } from "./broadcast";
import { findSession } from "./findSession";
import { handleFetchSessionTranscript } from "./handleFetchSessionTranscript";
import type { SessionManager } from "./SessionManager";
import type { Session } from "./types";

vi.mock("../shared/codex/findCodexRolloutPathSync", () => ({
	findCodexRolloutPathSync: vi.fn(),
}));
vi.mock("./findSession", () => ({ findSession: vi.fn() }));
vi.mock("./readTranscriptEchoes", () => ({
	readTranscriptEchoes: vi.fn(async () => []),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const rolloutMock = vi.mocked(findCodexRolloutPathSync);
let dir: string;
const rollouts = new Map<string, string>();

function writeRollout(conversationId: string, reply: string): void {
	const path = join(dir, `rollout-x-${conversationId}.jsonl`);
	const entries = [
		{ type: "event_msg", payload: { type: "user_message", message: "go" } },
		{ type: "event_msg", payload: { type: "agent_message", message: reply } },
	];
	writeFileSync(path, entries.map((e) => JSON.stringify(e)).join("\n"));
	rollouts.set(conversationId, path);
}

async function fetchTexts(session: Session): Promise<string[]> {
	vi.mocked(findSession).mockReturnValue(session);
	const sent: string[] = [];
	const client: SessionClient = { send: (data) => sent.push(data) };
	await handleFetchSessionTranscript(client, {} as SessionManager, {
		sessionId: session.id,
	});
	const { messages } = JSON.parse(sent[0]) as {
		messages: { text?: string }[];
	};
	return messages.map((m) => m.text ?? "");
}

describe("handleFetchSessionTranscript", () => {
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "fetch-transcript-"));
		rollouts.clear();
		rolloutMock.mockImplementation((id) => rollouts.get(id) ?? null);
		writeRollout("conv-1", "phase one reply");
		writeRollout("conv-2", "phase three reply");
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	function codexSession(): Session {
		return makeSession({
			id: "16",
			cwd: "/repo",
			harness: "codex-sdk",
			harnessSessionId: "conv-1",
		});
	}

	it("reads the new conversation's rollout after a rebind, without a transcript watch", async () => {
		const session = codexSession();
		expect(await fetchTexts(session)).toContain("phase one reply");
		expect(session.watchedTranscriptId).toBeUndefined();

		session.harnessSessionId = "conv-2";

		const texts = await fetchTexts(session);
		expect(texts).toContain("phase three reply");
		expect(texts).not.toContain("phase one reply");
		expect(session.transcriptPath).toBe(rollouts.get("conv-2"));
	});

	it("drops the cached path while the session is unbound", async () => {
		const session = codexSession();
		await fetchTexts(session);

		session.harnessSessionId = undefined;

		expect(await fetchTexts(session)).toEqual([]);
		expect(session.transcriptPath).toBeUndefined();
	});
});
