import { describe, expect, it } from "vitest";
import { isShortcutsSheetKey } from "./isShortcutsSheetKey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "/",
		code: "Slash",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isShortcutsSheetKey", () => {
	it("matches Ctrl+/ and Cmd+/", () => {
		expect(isShortcutsSheetKey(event({ ctrlKey: true }))).toBe(true);
		expect(isShortcutsSheetKey(event({ metaKey: true }))).toBe(true);
	});

	it("matches the physical slash key on a layout where it types another character", () => {
		expect(isShortcutsSheetKey(event({ ctrlKey: true, key: "-" }))).toBe(true);
	});

	it("ignores a bare / and Alt chords", () => {
		expect(isShortcutsSheetKey(event({}))).toBe(false);
		expect(isShortcutsSheetKey(event({ ctrlKey: true, altKey: true }))).toBe(
			false,
		);
	});

	it("ignores other keys and keyup", () => {
		expect(
			isShortcutsSheetKey(event({ ctrlKey: true, key: ".", code: "Period" })),
		).toBe(false);
		expect(isShortcutsSheetKey(event({ ctrlKey: true, type: "keyup" }))).toBe(
			false,
		);
	});
});
