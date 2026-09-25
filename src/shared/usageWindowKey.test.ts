import { describe, expect, it } from "vitest";
import { parseUsageWindowKey, usageWindowKey } from "./usageWindowKey";

describe("usageWindowKey", () => {
	it("keeps Claude's bare window name as the default key", () => {
		expect(usageWindowKey(undefined, "five_hour")).toBe("five_hour");
		expect(usageWindowKey("claude", "seven_day")).toBe("seven_day");
	});

	it("prefixes other harnesses", () => {
		expect(usageWindowKey("codex", "five_hour")).toBe("codex:five_hour");
	});
});

describe("parseUsageWindowKey", () => {
	it("round-trips every key", () => {
		expect(parseUsageWindowKey("seven_day")).toEqual({
			harness: "claude",
			window: "seven_day",
		});
		expect(parseUsageWindowKey("codex:five_hour")).toEqual({
			harness: "codex",
			window: "five_hour",
		});
	});

	it("rejects unknown harnesses, windows and an explicit claude prefix", () => {
		expect(parseUsageWindowKey("nope:five_hour")).toBeUndefined();
		expect(parseUsageWindowKey("codex:one_day")).toBeUndefined();
		expect(parseUsageWindowKey("claude:five_hour")).toBeUndefined();
	});
});
