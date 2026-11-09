import { describe, expect, it } from "vitest";
import {
	type AutoRestartInput,
	autoRestartBlocker as blockerAt,
	type LiveSession,
} from "./autoRestartBlocker";

const loop = { phase: "waiting" as const, since: "2026-01-01T00:00:00Z" };
const NOW = 10_000_000;
const MINUTE = 60_000;

function autoRestartBlocker(i: AutoRestartInput): string | undefined {
	return blockerAt(i, NOW);
}

function input(overrides: Partial<AutoRestartInput> = {}): AutoRestartInput {
	return {
		restart: ["daemon"],
		buildPending: false,
		loop,
		sessions: [],
		...overrides,
	};
}

function session(overrides: Partial<LiveSession>): LiveSession {
	return { name: "s", status: "running", commandType: "claude", ...overrides };
}

function preview(kind: "question" | "check" | "show") {
	return { requestId: "r", title: "t", body: "", prNumber: null, kind };
}

describe("autoRestartBlocker", () => {
	it("passes when the node has no live sessions", () => {
		expect(autoRestartBlocker(input())).toBeUndefined();
	});

	it("passes when every session is waiting, asking a question or awaiting a check", () => {
		expect(
			autoRestartBlocker(
				input({
					sessions: [
						session({ status: "waiting" }),
						session({ pendingPrPreview: preview("question") }),
						session({ pendingPrPreview: preview("check") }),
						session({ status: "done" }),
					],
				}),
			),
		).toBeUndefined();
	});

	it("blocks on a running session, even one showing a link", () => {
		expect(
			autoRestartBlocker(input({ sessions: [session({ name: "busy" })] })),
		).toBe("waiting on 1 running session (busy)");
		expect(
			autoRestartBlocker(
				input({
					sessions: [session({ name: "a", pendingPrPreview: preview("show") })],
				}),
			),
		).toBe("waiting on 1 running session (a)");
	});

	it("blocks on a session that resumed work over its pending check", () => {
		expect(
			autoRestartBlocker(
				input({
					sessions: [
						session({
							name: "resumed",
							pendingPrPreview: preview("check"),
							resumedOverPreview: "r",
						}),
					],
				}),
			),
		).toBe("waiting on 1 running session (resumed)");
	});

	it("passes when the resumed-over preview has been replaced by a new blocking one", () => {
		expect(
			autoRestartBlocker(
				input({
					sessions: [
						session({
							pendingPrPreview: preview("question"),
							resumedOverPreview: "earlier",
						}),
					],
				}),
			),
		).toBeUndefined();
	});

	it("ignores run sessions and sessions on linked nodes", () => {
		expect(
			autoRestartBlocker(
				input({
					sessions: [
						session({ commandType: "run" }),
						session({ node: "laptop" }),
					],
				}),
			),
		).toBeUndefined();
	});

	it("blocks while the user was active within the idle window", () => {
		expect(
			autoRestartBlocker(input({ lastUserActivityAt: NOW - 2 * MINUTE + 1 })),
		).toBe("you're active · restarting 2m after you stop");
		expect(
			autoRestartBlocker(
				input({ lastUserActivityAt: NOW - 4 * MINUTE, idleMinutes: 5 }),
			),
		).toBe("you're active · restarting 5m after you stop");
	});

	it("passes once the idle window has just expired or with no activity recorded", () => {
		expect(
			autoRestartBlocker(input({ lastUserActivityAt: NOW - 2 * MINUTE })),
		).toBeUndefined();
		expect(
			autoRestartBlocker(
				input({ lastUserActivityAt: NOW - 5 * MINUTE, idleMinutes: 5 }),
			),
		).toBeUndefined();
		expect(autoRestartBlocker(input({ idleMinutes: 5 }))).toBeUndefined();
	});

	it("names busy sessions ahead of user activity", () => {
		expect(
			autoRestartBlocker(
				input({
					sessions: [session({ name: "busy" })],
					lastUserActivityAt: NOW,
				}),
			),
		).toBe("waiting on 1 running session (busy)");
	});

	it("blocks while the build is pending, the loop is paused or diverged, or the daemon is unreachable", () => {
		expect(autoRestartBlocker(input({ buildPending: true }))).toBe(
			"build pending",
		);
		expect(autoRestartBlocker(input({ loop: { ...loop, paused: true } }))).toBe(
			"auto-update paused",
		);
		expect(
			autoRestartBlocker(input({ loop: { ...loop, phase: "diverged" } })),
		).toBe("auto-update diverged");
		expect(autoRestartBlocker(input({ loop: undefined }))).toBe(
			"daemon not reachable",
		);
	});
});
