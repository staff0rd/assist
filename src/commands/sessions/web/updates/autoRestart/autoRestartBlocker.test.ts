import { describe, expect, it } from "vitest";
import {
	type AutoRestartInput,
	autoRestartBlocker,
	type LiveSession,
} from "./autoRestartBlocker";

const loop = { phase: "waiting" as const, since: "2026-01-01T00:00:00Z" };

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
