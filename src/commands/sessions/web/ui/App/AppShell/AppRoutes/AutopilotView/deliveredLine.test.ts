import { describe, expect, it } from "vitest";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { deliveredLine } from "./deliveredLine";
import { deliveredPill } from "./deliveredPill";

const item: AutopilotItemView = {
	id: 1867,
	name: "Command ships cycle contracts",
	status: "in-progress",
	sessionId: null,
	startedAt: "t",
	summary: "Contracts cycle on every trading agent.",
	phase: 3,
	totalPhases: 2,
	donePhases: 2,
	remaining: [{ number: null, name: "Review" }],
	commits: 2,
	insertions: 677,
	deletions: 35,
};

describe("deliveredLine", () => {
	it("says what a stalled item did and that it stalled in Review", () => {
		expect(deliveredLine(item)).toBe(
			"Contracts cycle on every trading agent. Stalled in Review: no session is running it, so it is not done.",
		);
		expect(deliveredPill(item).label).toBe("stalled in Review");
	});

	it("names the phase an item stalled in before Review", () => {
		expect(deliveredPill({ ...item, phase: 2 }).label).toBe(
			"stalled in phase 2 of 2",
		);
	});
});
