import { describe, expect, it } from "vitest";
import { isWindowsCwd } from "./isWindowsCwd";

describe("isWindowsCwd", () => {
	it("matches drive-letter paths with either slash", () => {
		expect(isWindowsCwd(String.raw`C:\Users\me\repo`)).toBe(true);
		expect(isWindowsCwd("D:/projects/app")).toBe(true);
	});

	it("rejects POSIX paths", () => {
		expect(isWindowsCwd("/home/me/repo")).toBe(false);
		expect(isWindowsCwd("/mnt/c/Users/me/repo")).toBe(false);
		expect(isWindowsCwd("relative/path")).toBe(false);
	});

	it("rejects undefined", () => {
		expect(isWindowsCwd(undefined)).toBe(false);
	});
});
