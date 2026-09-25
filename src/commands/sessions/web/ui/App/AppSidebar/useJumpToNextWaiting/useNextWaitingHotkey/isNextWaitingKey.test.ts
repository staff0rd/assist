import { describe, expect, it } from "vitest";
import { isNextWaitingKey } from "./isNextWaitingKey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: ".",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isNextWaitingKey", () => {
	it("matches Ctrl+.", () => {
		expect(isNextWaitingKey(event({ ctrlKey: true }))).toBe(true);
	});

	it("matches Cmd+.", () => {
		expect(isNextWaitingKey(event({ metaKey: true }))).toBe(true);
	});

	it("ignores a bare .", () => {
		expect(isNextWaitingKey(event({}))).toBe(false);
	});

	it("ignores Ctrl+Shift+. and Ctrl+Alt+.", () => {
		expect(isNextWaitingKey(event({ ctrlKey: true, shiftKey: true }))).toBe(
			false,
		);
		expect(isNextWaitingKey(event({ ctrlKey: true, altKey: true }))).toBe(
			false,
		);
	});

	it("ignores other keys and keyup", () => {
		expect(isNextWaitingKey(event({ ctrlKey: true, key: ">" }))).toBe(false);
		expect(isNextWaitingKey(event({ ctrlKey: true, key: "," }))).toBe(false);
		expect(isNextWaitingKey(event({ ctrlKey: true, type: "keyup" }))).toBe(
			false,
		);
	});
});
