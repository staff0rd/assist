import { describe, expect, it } from "vitest";
import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";
import { formatLastRun } from "./formatLastRun";

const time = (iso: string) => iso;

function status(runs: AutopilotStatus["runs"]): AutopilotStatus {
	return { cwd: "/repo", runs } as AutopilotStatus;
}

describe("formatLastRun", () => {
	it("reports when no run has finished", () => {
		expect(formatLastRun(status([]), time)).toEqual([
			"No finished autopilot run recorded for /repo.",
		]);
	});

	it("prints the newest run's summary and items", () => {
		const lines = formatLastRun(
			status([
				{
					at: "T2",
					outcome: "finished",
					startedAt: "T1",
					items: [1921, 1922],
					summary: {
						checked: "status",
						decided: "fix stall",
						started: "a1921",
						next: "judge a1921",
					},
				},
				{ at: "T0", outcome: "finished" },
			]),
			time,
		);
		expect(lines).toEqual([
			"Last run: T1 to T2",
			"  Checked:  status",
			"  Decided:  fix stall",
			"  Started:  a1921",
			"  Next:     judge a1921",
			"  Items:    a1921, a1922",
		]);
	});

	it("notes a run with no summary or items", () => {
		expect(
			formatLastRun(status([{ at: "T2", outcome: "finished" }]), time),
		).toEqual([
			"Last run: T2",
			"  Summary:  none recorded",
			"  Items:    none",
		]);
	});
});
