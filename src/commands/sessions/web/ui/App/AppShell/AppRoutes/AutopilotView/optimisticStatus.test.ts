import { describe, expect, it } from "vitest";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { optimisticStatus } from "./optimisticStatus";

const status = {
	paused: true,
	failure: { at: "", item: "a7", reason: "still not done" },
	nextTickAt: null,
} as AutopilotStatus;

describe("optimisticStatus", () => {
	it("clears the pause and its banner on resume before the server replies", () => {
		expect(optimisticStatus("resume", status)).toMatchObject({
			paused: false,
			failure: null,
		});
	});

	it("leaves the status alone for actions with no predictable result", () => {
		expect(optimisticStatus("run", status)).toBe(status);
	});
});
