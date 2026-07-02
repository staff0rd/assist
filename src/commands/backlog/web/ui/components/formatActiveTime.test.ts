import { describe, expect, it } from "vitest";
import { formatActiveTime } from "./formatActiveTime";
import { formatTokens } from "./formatTokens";

describe("formatTokens", () => {
	it("shows raw counts below 1000", () => {
		expect(formatTokens(0)).toBe("0");
		expect(formatTokens(950)).toBe("950");
	});

	it("abbreviates thousands and millions", () => {
		expect(formatTokens(12_300)).toBe("12.3k");
		expect(formatTokens(4_500_000)).toBe("4.5M");
	});
});

describe("formatActiveTime", () => {
	it("shows seconds under a minute", () => {
		expect(formatActiveTime(0)).toBe("0s");
		expect(formatActiveTime(45_000)).toBe("45s");
	});

	it("shows minutes and seconds under an hour, dropping zero seconds", () => {
		expect(formatActiveTime(200_000)).toBe("3m 20s");
		expect(formatActiveTime(180_000)).toBe("3m");
	});

	it("shows hours and minutes past an hour, dropping zero minutes", () => {
		expect(formatActiveTime(3_840_000)).toBe("1h 4m");
		expect(formatActiveTime(3_600_000)).toBe("1h");
	});
});
