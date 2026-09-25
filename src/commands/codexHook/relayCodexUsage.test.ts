import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSend = vi.fn();

vi.mock("../sessions/daemon/sendToDaemonAwaitAck", () => ({
	sendToDaemonAwaitAck: (msg: unknown) => mockSend(msg),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { relayCodexUsage } from "./relayCodexUsage";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("ASSIST_SESSION_ID", "s1");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("relayCodexUsage", () => {
	it("relays the rollout path after a tool call and at turn end", async () => {
		await relayCodexUsage("PostToolUse", "/r.jsonl");
		await relayCodexUsage("Stop", "/r.jsonl");

		expect(mockSend).toHaveBeenCalledTimes(2);
		expect(mockSend).toHaveBeenCalledWith({
			type: "codex-usage",
			sessionId: "s1",
			transcriptPath: "/r.jsonl",
			ack: true,
		});
	});

	it("stays quiet for other events, a missing path or an untracked session", async () => {
		await relayCodexUsage("PreToolUse", "/r.jsonl");
		await relayCodexUsage("Stop", undefined);
		vi.stubEnv("ASSIST_SESSION_ID", "");
		await relayCodexUsage("Stop", "/r.jsonl");

		expect(mockSend).not.toHaveBeenCalled();
	});

	it("swallows a failed delivery", async () => {
		mockSend.mockRejectedValue(new Error("down"));

		await expect(relayCodexUsage("Stop", "/r.jsonl")).resolves.toBeUndefined();
	});
});
