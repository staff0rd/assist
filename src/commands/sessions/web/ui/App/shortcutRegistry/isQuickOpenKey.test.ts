import { describe, expect, it } from "vitest";
import { isQuickOpenKey } from "./isQuickOpenKey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "p",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isQuickOpenKey", () => {
	it("matches Ctrl+P", () => {
		expect(isQuickOpenKey(event({ ctrlKey: true }))).toBe(true);
	});

	it("matches Cmd+P", () => {
		expect(isQuickOpenKey(event({ metaKey: true }))).toBe(true);
	});

	it("matches an upper-case P from a capslocked keyboard", () => {
		expect(isQuickOpenKey(event({ ctrlKey: true, key: "P" }))).toBe(true);
	});

	it("ignores a bare p", () => {
		expect(isQuickOpenKey(event({}))).toBe(false);
	});

	it("ignores Ctrl+Shift+P and Ctrl+Alt+P", () => {
		expect(isQuickOpenKey(event({ ctrlKey: true, shiftKey: true }))).toBe(
			false,
		);
		expect(isQuickOpenKey(event({ ctrlKey: true, altKey: true }))).toBe(false);
	});

	it("ignores other keys and keyup", () => {
		expect(isQuickOpenKey(event({ ctrlKey: true, key: "o" }))).toBe(false);
		expect(isQuickOpenKey(event({ ctrlKey: true, type: "keyup" }))).toBe(false);
	});
});
