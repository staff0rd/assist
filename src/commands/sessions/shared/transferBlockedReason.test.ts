import { describe, expect, it } from "vitest";
import { transferBlockedReason } from "./transferBlockedReason";

describe("transferBlockedReason", () => {
	it("gives the harness reason for a Pi prompt session", () => {
		expect(
			transferBlockedReason({ commandType: "claude", harness: "pi" }),
		).toBe("Pi can't resume a conversation on another node");
	});

	it("does not block a Claude prompt session", () => {
		expect(
			transferBlockedReason({ commandType: "claude", harness: "claude" }),
		).toBeUndefined();
	});

	it("does not block sessions that are not prompt sessions", () => {
		expect(
			transferBlockedReason({ commandType: "run", harness: "pi" }),
		).toBeUndefined();
		expect(
			transferBlockedReason({
				commandType: "claude",
				harness: "pi",
				assistArgs: ["draft"],
			}),
		).toBeUndefined();
	});
});
