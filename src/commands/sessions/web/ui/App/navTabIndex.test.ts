import { describe, expect, it } from "vitest";
import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import { navTabIndex } from "./navTabIndex";

const alt: HotkeyChord[] = [{ modifiers: ["Alt"] }];

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
			expect(
				navTabIndex(event({ key: String(n), code: `Digit${n}` }), alt),
			).toBe(n - 1);
	});

	it("matches macOS Option+1, which types ¡", () => {
		expect(navTabIndex(event({ key: "¡" }), alt)).toBe(0);
	});

	it("uses a configured modifier in place of Alt", () => {
		const ctrlAlt: HotkeyChord[] = [{ modifiers: ["Ctrl", "Alt"] }];
		expect(navTabIndex(event({ ctrlKey: true }), ctrlAlt)).toBe(0);
		expect(navTabIndex(event({}), ctrlAlt)).toBeUndefined();
	});

	it("ignores digits beyond 5 and the numpad", () => {
		expect(
			navTabIndex(event({ key: "6", code: "Digit6" }), alt),
		).toBeUndefined();
		expect(navTabIndex(event({ code: "Numpad1" }), alt)).toBeUndefined();
	});

	it("ignores a bare digit and other modifiers", () => {
		expect(navTabIndex(event({ altKey: false }), alt)).toBeUndefined();
		expect(navTabIndex(event({ ctrlKey: true }), alt)).toBeUndefined();
		expect(navTabIndex(event({ metaKey: true }), alt)).toBeUndefined();
		expect(navTabIndex(event({ shiftKey: true }), alt)).toBeUndefined();
	});

	it("ignores keyup", () => {
		expect(navTabIndex(event({ type: "keyup" }), alt)).toBeUndefined();
	});
});
