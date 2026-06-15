import { describe, expect, it } from "vitest";
import {
	isWindowsSessionId,
	stripWindowsSessionId,
	toWindowsSessionId,
} from "./toWindowsSessionId";

describe("windowsSessionId", () => {
	it("round-trips namespacing", () => {
		expect(toWindowsSessionId("3")).toBe("w-3");
		expect(isWindowsSessionId("w-3")).toBe(true);
		expect(isWindowsSessionId("3")).toBe(false);
		expect(stripWindowsSessionId("w-3")).toBe("3");
	});

	it("leaves un-prefixed ids untouched when stripping", () => {
		expect(stripWindowsSessionId("3")).toBe("3");
	});
});
