import { describe, expect, it } from "vitest";
import { isNewSessionKey } from "./isNewSessionKey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "n",
		code: "KeyN",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isNewSessionKey", () => {
	it("matches Ctrl+N, Cmd+N and Alt+N", () => {
		expect(isNewSessionKey(event({ ctrlKey: true }))).toBe(true);
		expect(isNewSessionKey(event({ metaKey: true }))).toBe(true);
		expect(isNewSessionKey(event({ altKey: true }))).toBe(true);
	});

	it("matches an upper-case N from a capslocked keyboard", () => {
		expect(isNewSessionKey(event({ ctrlKey: true, key: "N" }))).toBe(true);
	});

	it("matches macOS Option+N, which reports a dead key", () => {
		expect(isNewSessionKey(event({ altKey: true, key: "Dead" }))).toBe(true);
	});

	it("ignores a bare n", () => {
		expect(isNewSessionKey(event({}))).toBe(false);
	});

	it("ignores Shift and Ctrl+Alt (AltGr) chords", () => {
		expect(isNewSessionKey(event({ ctrlKey: true, shiftKey: true }))).toBe(
			false,
		);
		expect(isNewSessionKey(event({ altKey: true, shiftKey: true }))).toBe(
			false,
		);
		expect(isNewSessionKey(event({ ctrlKey: true, altKey: true }))).toBe(false);
	});

	it("ignores other keys and keyup", () => {
		expect(
			isNewSessionKey(event({ ctrlKey: true, key: "m", code: "KeyM" })),
		).toBe(false);
		expect(isNewSessionKey(event({ ctrlKey: true, type: "keyup" }))).toBe(
			false,
		);
	});
});
