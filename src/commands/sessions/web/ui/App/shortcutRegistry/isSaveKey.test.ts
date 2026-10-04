import { describe, expect, it } from "vitest";
import { isSaveKey } from "./isSaveKey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "s",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isSaveKey", () => {
	it("matches Ctrl+S", () => {
		expect(isSaveKey(event({ ctrlKey: true }))).toBe(true);
	});

	it("matches Cmd+S", () => {
		expect(isSaveKey(event({ metaKey: true }))).toBe(true);
	});

	it("matches an upper-case S from a capslocked keyboard", () => {
		expect(isSaveKey(event({ ctrlKey: true, key: "S" }))).toBe(true);
	});

	it("ignores a bare s", () => {
		expect(isSaveKey(event({}))).toBe(false);
	});

	it("ignores Ctrl+Shift+S and Ctrl+Alt+S", () => {
		expect(isSaveKey(event({ ctrlKey: true, shiftKey: true }))).toBe(false);
		expect(isSaveKey(event({ ctrlKey: true, altKey: true }))).toBe(false);
	});

	it("ignores other keys and keyup", () => {
		expect(isSaveKey(event({ ctrlKey: true, key: "a" }))).toBe(false);
		expect(isSaveKey(event({ ctrlKey: true, type: "keyup" }))).toBe(false);
	});
});
