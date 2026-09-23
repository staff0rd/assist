import { describe, expect, it } from "vitest";
import type { ReleaseNodeState, ReleaseRunNodeState } from "../releases/types";
import { releaseRunState } from "./releaseRunState";

const NOW = Date.parse("2026-09-22T09:05:00Z");

function node(
	run: ReleaseRunNodeState | null,
	overrides: Partial<ReleaseNodeState> = {},
): ReleaseNodeState {
	return {
		id: "eu-prod",
		kind: "environment",
		environment: "EU Production",
		label: "eu-prod",
		live: null,
		deployedAt: null,
		behind: null,
		queued: null,
		run,
		...overrides,
	};
}

function job(
	overrides: Partial<ReleaseRunNodeState> = {},
): ReleaseRunNodeState {
	return {
		status: "ok",
		conclusion: "success",
		startedAt: "2026-09-22T08:00:00Z",
		completedAt: "2026-09-22T08:01:37Z",
		url: null,
		...overrides,
	};
}

describe("releaseRunState", () => {
	it("reports how long a deploy took", () => {
		const mark = releaseRunState(node(job()), NOW);
		expect(mark.tone).toBe("ok");
		expect(mark.short).toBe("1m37s");
		expect(mark.tooltip).toBe("Deployed in 1m37s");
	});

	it("says built rather than deployed for a build step", () => {
		const mark = releaseRunState(
			node(job(), { kind: "build", environment: null }),
			NOW,
		);
		expect(mark.tooltip).toBe("Built in 1m37s");
	});

	it("reports how long a job has been waiting for approval", () => {
		const mark = releaseRunState(
			node(
				job({
					status: "gate",
					conclusion: null,
					startedAt: "2026-09-22T06:17:00Z",
					completedAt: null,
				}),
			),
			NOW,
		);
		expect(mark.tone).toBe("gate");
		expect(mark.short).toBe("2h48m");
		expect(mark.tooltip).toBe("Waiting for someone to approve, for 2h48m");
	});

	it("reports a job the run never reached", () => {
		const mark = releaseRunState(
			node(
				job({
					status: "idle",
					conclusion: "skipped",
					startedAt: null,
					completedAt: null,
				}),
			),
			NOW,
		);
		expect(mark.short).toBe("skipped");
		expect(mark.tooltip).toBe("This run never got here — skipped");
	});

	it("reports a failed job", () => {
		const mark = releaseRunState(
			node(job({ status: "fail", conclusion: "failure" })),
			NOW,
		);
		expect(mark.tone).toBe("fail");
		expect(mark.tooltip).toBe("Failed after 1m37s — failure");
	});

	it("reports a running job", () => {
		const mark = releaseRunState(
			node(
				job({
					status: "running",
					conclusion: null,
					startedAt: "2026-09-22T09:00:00Z",
					completedAt: null,
				}),
			),
			NOW,
		);
		expect(mark.short).toBe("5m00s");
		expect(mark.tooltip).toBe("Running for 5m00s");
	});

	it("says so when there is no run to read", () => {
		const mark = releaseRunState(node(null), NOW);
		expect(mark.short).toBe("no run");
		expect(mark.tooltip).toBe("No run of this workflow to read");
	});
});
