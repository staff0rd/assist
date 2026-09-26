import { beforeEach, describe, expect, it, vi } from "vitest";

const readCodexRolloutUsage = vi.fn();
const applyCodexUsage = vi.fn();

vi.mock("../shared/codex/codexRolloutUsage", () => ({
	readCodexRolloutUsage: (path: string) => readCodexRolloutUsage(path),
}));

vi.mock("./applyCodexUsage", () => ({
	applyCodexUsage: (...args: unknown[]) => applyCodexUsage(...args),
}));

import { handleCodexUsage } from "./handleCodexUsage";
import type { SessionManager } from "./SessionManager";

const codexWindows = [{ window: "codex:seven_day", resetsAt: 900 }];

function manager() {
	return {
		links: { route: vi.fn(() => false) },
		clients: {
			updateHarnessLimits: vi.fn(),
			currentWindows: vi.fn(() => codexWindows),
		},
		update: vi.fn((mutate: (s: Map<string, unknown>) => boolean) =>
			mutate(new Map()),
		),
	};
}

async function handle(m: ReturnType<typeof manager>) {
	const client = { send: vi.fn() };
	handleCodexUsage(client, m as unknown as SessionManager, {
		sessionId: "s1",
		transcriptPath: "/r.jsonl",
		ack: true,
	});
	await vi.waitFor(() => expect(applyCodexUsage).toHaveBeenCalled());
	return client;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("handleCodexUsage", () => {
	it("acks, then attributes tokens to the windows the rollout reported", async () => {
		const rateLimits = { seven_day: { used_percentage: 3, resets_at: 900 } };
		readCodexRolloutUsage.mockResolvedValue({ responses: [], rateLimits });
		const m = manager();

		const client = await handle(m);

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "ack", sessionId: "s1" }),
		);
		expect(m.clients.updateHarnessLimits).toHaveBeenCalledWith(
			"codex",
			rateLimits,
		);
		expect(applyCodexUsage.mock.calls[0][3]).toEqual(codexWindows);
	});

	it("attributes no window when the rollout reports no limits (e.g. via LiteLLM)", async () => {
		readCodexRolloutUsage.mockResolvedValue({ responses: [] });
		const m = manager();

		await handle(m);

		expect(m.clients.updateHarnessLimits).not.toHaveBeenCalled();
		expect(applyCodexUsage.mock.calls[0][3]).toEqual([]);
	});
});
