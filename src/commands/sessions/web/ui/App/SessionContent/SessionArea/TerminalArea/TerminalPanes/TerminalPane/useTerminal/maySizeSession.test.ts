import { describe, expect, it } from "vitest";
import { maySizeSession } from "./maySizeSession";

describe("maySizeSession", () => {
	it("lets the active viewer size its session from any pane", () => {
		expect(maySizeSession("mine", false, false)).toBe(true);
	});

	it("never sizes a session another viewer owns", () => {
		expect(maySizeSession("other", true, true)).toBe(false);
	});

	it("claims a free session only from a visible pane in a focused window", () => {
		expect(maySizeSession("free", true, true)).toBe(true);
		expect(maySizeSession("free", false, true)).toBe(false);
		expect(maySizeSession("free", true, false)).toBe(false);
	});
});
