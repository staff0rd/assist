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

	it("namespaces idempotently so version skew cannot grow the prefix", () => {
		expect(toWindowsSessionId("w-3")).toBe("w-3");
		expect(toWindowsSessionId(toWindowsSessionId("3"))).toBe("w-3");
	});

	it("strips every leading prefix from an already-corrupted id", () => {
		expect(stripWindowsSessionId("w-w-w-4")).toBe("4");
	});
});
