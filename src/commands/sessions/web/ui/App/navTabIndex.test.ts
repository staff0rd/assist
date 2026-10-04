import { describe, expect, it } from "vitest";
import { navTabIndex } from "./navTabIndex";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "1",
		code: "Digit1",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: true,
		...overrides,
	} as KeyboardEvent;
}

describe("navTabIndex", () => {
	it("maps Alt+1 to Alt+5 onto tab indexes 0 to 4", () => {
		for (const n of [1, 2, 3, 4, 5])
			expect(navTabIndex(event({ key: String(n), code: `Digit${n}` }))).toBe(
				n - 1,
			);
	});

	it("matches macOS Option+1, which types ¡", () => {
		expect(navTabIndex(event({ key: "¡" }))).toBe(0);
	});

	it("ignores digits beyond 5 and the numpad", () => {
		expect(navTabIndex(event({ key: "6", code: "Digit6" }))).toBeUndefined();
		expect(navTabIndex(event({ code: "Numpad1" }))).toBeUndefined();
	});

	it("ignores a bare digit and other modifiers", () => {
		expect(navTabIndex(event({ altKey: false }))).toBeUndefined();
		expect(navTabIndex(event({ ctrlKey: true }))).toBeUndefined();
		expect(navTabIndex(event({ metaKey: true }))).toBeUndefined();
		expect(navTabIndex(event({ shiftKey: true }))).toBeUndefined();
	});

	it("ignores keyup", () => {
		expect(navTabIndex(event({ type: "keyup" }))).toBeUndefined();
	});
});
