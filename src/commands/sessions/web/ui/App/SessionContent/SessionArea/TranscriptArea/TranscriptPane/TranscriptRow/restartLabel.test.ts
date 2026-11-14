import { describe, expect, it } from "vitest";
import { restartLabel } from "./restartLabel";

describe("restartLabel", () => {
	it.each([
		[0, "Daemon restarted"],
		[1, "Daemon restarted · 1 background task killed"],
		[3, "Daemon restarted · 3 background tasks killed"],
	])("labels %i killed tasks", (killed, label) => {
		expect(restartLabel(killed)).toBe(label);
	});
});
