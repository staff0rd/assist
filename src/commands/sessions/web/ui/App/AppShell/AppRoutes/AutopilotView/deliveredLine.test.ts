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
	why: "Predicts TUSK-1 +150k/h operating.",
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
			"Not delivered: stalled in Review with 2 of 2 phases built and nothing running it. It set out to: Predicts TUSK-1 +150k/h operating.",
		);
		expect(deliveredPill(item).label).toBe("stalled in Review");
	});

	it("names the phase an item stalled in before Review", () => {
		expect(deliveredPill({ ...item, phase: 2 }).label).toBe(
			"stalled in phase 2 of 2",
		);
	});
});
