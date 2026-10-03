import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResponseUsage } from "../../../shared/db/recordPhaseTranscriptUsage";

const persistPhaseTokens = vi.fn();
const flushPhaseActiveMs = vi.fn();

vi.mock("./persistPhaseTokens", () => ({
	persistPhaseTokens: (...args: unknown[]) => persistPhaseTokens(...args),
}));

vi.mock("./flushPhaseActiveMs", () => ({
	flushPhaseActiveMs: (...args: unknown[]) => flushPhaseActiveMs(...args),
}));

import { makeSession } from "../../../test/mothers/makeSession";
import { applyCodexUsage } from "./applyCodexUsage";

const responses: ResponseUsage[] = [
	{ messageId: "codex:c:10", inputTokens: 8, outputTokens: 2 },
];
const windows = [{ window: "codex:seven_day" as const, resetsAt: 900 }];

beforeEach(() => {
	vi.clearAllMocks();
});

describe("applyCodexUsage", () => {
	it("records context and accrues tokens against the running backlog phase", async () => {
		const session = makeSession({
			id: "s1",
			harness: "codex",
			status: "running",
			runningSince: 1000,
			activity: { kind: "backlog", startedAt: 1000, itemId: 7, phase: 2 },
		});
		const sessions = new Map([[session.id, session]]);

		const changed = applyCodexUsage(
			sessions,
			"s1",
			{ responses, usedPct: 42 },
			windows,
		);

		expect(changed).toBe(true);
		expect(session.usedPct).toBe(42);
		expect(persistPhaseTokens).toHaveBeenCalledWith(
			7,
			1,
			expect.any(Function),
			42,
			windows,
		);
		const load = persistPhaseTokens.mock.calls[0][2] as () => Promise<unknown>;
		await expect(load()).resolves.toBe(responses);
		expect(flushPhaseActiveMs).toHaveBeenCalledWith(session);
	});

	it("skips token accrual for a session that is not on a backlog phase", () => {
		const session = makeSession({ id: "s1", harness: "codex" });

		applyCodexUsage(new Map([[session.id, session]]), "s1", { responses }, []);

		expect(persistPhaseTokens).not.toHaveBeenCalled();
	});

	it("reports no change for an unknown session", () => {
		expect(applyCodexUsage(new Map(), "missing", { responses }, [])).toBe(
			false,
		);
	});
});
