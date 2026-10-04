import { describe, expect, it } from "vitest";
import { defaultHotkeys } from "../../../../../../../../../../../../shared/hotkeys/defaultHotkeys";
import { hotkeyBindingsStore } from "../../../../../../../hotkeyBindingsStore";
import { isAppHotkey } from "./isAppHotkey";

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "",
		code: "",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("isAppHotkey", () => {
	it("keeps app hotkeys out of the terminal", () => {
		expect(isAppHotkey(event({ altKey: true, key: "¡", code: "Digit1" }))).toBe(
			true,
		);
		expect(isAppHotkey(event({ ctrlKey: true, key: "/", code: "Slash" }))).toBe(
			true,
		);
		expect(isAppHotkey(event({ ctrlKey: true, key: "p", code: "KeyP" }))).toBe(
			true,
		);
		expect(isAppHotkey(event({ ctrlKey: true, key: "n", code: "KeyN" }))).toBe(
			true,
		);
		for (const code of [
			"KeyA",
			"KeyS",
			"KeyD",
			"KeyW",
			"KeyE",
			"KeyR",
			"KeyZ",
			"KeyX",
			"KeyC",
		])
			expect(isAppHotkey(event({ altKey: true, code }))).toBe(true);
	});

	it("follows a remapped binding", () => {
		hotkeyBindingsStore.set({
			...defaultHotkeys,
			focusTerminal: ["Ctrl+Alt+J"],
		});
		try {
			expect(isAppHotkey(event({ altKey: true, code: "KeyS" }))).toBe(false);
			expect(
				isAppHotkey(event({ ctrlKey: true, altKey: true, code: "KeyJ" })),
			).toBe(true);
		} finally {
			hotkeyBindingsStore.set(defaultHotkeys);
		}
	});

	it("passes ordinary terminal keys through", () => {
		expect(isAppHotkey(event({ ctrlKey: true, key: "c", code: "KeyC" }))).toBe(
			false,
		);
		expect(isAppHotkey(event({ altKey: true, key: "b", code: "KeyB" }))).toBe(
			false,
		);
		expect(isAppHotkey(event({ key: "1", code: "Digit1" }))).toBe(false);
	});
});
