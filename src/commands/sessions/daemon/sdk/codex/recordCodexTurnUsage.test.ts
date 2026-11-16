import type { ThreadEvent } from "@openai/codex-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readCodexRolloutUsage } from "../../../shared/codex/codexRolloutUsage";
import { findCodexRolloutPath } from "../../../shared/codex/findCodexRolloutPath";
import { setSdkUsageSink } from "../sdkUsageSink";
import { recordCodexTurnUsage } from "./recordCodexTurnUsage";
import { withCodexTurnUsage } from "./withCodexTurnUsage";

vi.mock("../../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../shared/codex/findCodexRolloutPath", () => ({
	findCodexRolloutPath: vi.fn(),
}));
vi.mock("../../../shared/codex/codexRolloutUsage", () => ({
	readCodexRolloutUsage: vi.fn(),
}));

const turnUsage = {
	input_tokens: 10,
	cached_input_tokens: 4,
	cache_write_input_tokens: 0,
	output_tokens: 2,
	reasoning_output_tokens: 0,
};
const rolloutUsage = {
	responses: [{ messageId: "codex:t:12", inputTokens: 6, outputTokens: 2 }],
	usedPct: 7,
	rateLimits: { five_hour: { used_percentage: 3, resets_at: 1 } },
};

function sink() {
	const session = vi.fn();
	setSdkUsageSink({ limits: vi.fn(), usage: vi.fn(), session });
	return session;
}

describe("recordCodexTurnUsage", () => {
	beforeEach(() => {
		vi.mocked(findCodexRolloutPath).mockResolvedValue("/r/rollout-t.jsonl");
		vi.mocked(readCodexRolloutUsage).mockResolvedValue(rolloutUsage);
	});

	it("records the thread rollout's usage, context and limits on the codex account", async () => {
		const session = sink();
		await recordCodexTurnUsage("session 4", "4", "t", turnUsage);
		expect(findCodexRolloutPath).toHaveBeenCalledWith("t");
		expect(readCodexRolloutUsage).toHaveBeenCalledWith("/r/rollout-t.jsonl");
		expect(session).toHaveBeenCalledWith("4", "codex", rolloutUsage);
	});

	it("records nothing before the thread has started", async () => {
		const session = sink();
		await recordCodexTurnUsage("session 4", "4", null, turnUsage);
		expect(session).not.toHaveBeenCalled();
	});

	it("records nothing when the rollout cannot be found", async () => {
		const session = sink();
		vi.mocked(findCodexRolloutPath).mockResolvedValue(null);
		await recordCodexTurnUsage("session 4", "4", "t", turnUsage);
		expect(session).not.toHaveBeenCalled();
	});
});

describe("withCodexTurnUsage", () => {
	it("reports each completed turn's usage and passes every event through", async () => {
		const events: ThreadEvent[] = [
			{ type: "turn.started" },
			{ type: "turn.completed", usage: turnUsage },
		];
		async function* stream() {
			yield* events;
		}
		const onUsage = vi.fn();
		const seen: ThreadEvent[] = [];
		for await (const event of withCodexTurnUsage(stream(), onUsage))
			seen.push(event);
		expect(seen).toEqual(events);
		expect(onUsage).toHaveBeenCalledWith(turnUsage);
	});
});
