import { describe, expect, it } from "vitest";
import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import { parseChord } from "../../../../../shared/hotkeys/parseChord";
import { matchesChord } from "./matchesChord";

function chord(text: string): HotkeyChord {
	const parsed = parseChord(text);
	if (!parsed.ok) throw new Error(parsed.error);
	return parsed.chord;
}

function event(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		key: "",
		code: "KeyN",
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe("matchesChord", () => {
	it("matches on event.code, so macOS Option's dead keys still match", () => {
		expect(
			matchesChord(chord("Alt+N"), event({ altKey: true, key: "Dead" }), true),
		).toBe(true);
	});

	it("maps Mod to Ctrl off macOS and Cmd on macOS", () => {
		const mod = chord("Mod+N");
		expect(matchesChord(mod, event({ ctrlKey: true }), false)).toBe(true);
		expect(matchesChord(mod, event({ metaKey: true }), false)).toBe(false);
		expect(matchesChord(mod, event({ metaKey: true }), true)).toBe(true);
		expect(matchesChord(mod, event({ ctrlKey: true }), true)).toBe(false);
	});

	it("requires the modifiers to match exactly", () => {
		const ctrlAlt = chord("Ctrl+Alt+N");
		expect(
			matchesChord(ctrlAlt, event({ ctrlKey: true, altKey: true }), false),
		).toBe(true);
		expect(matchesChord(ctrlAlt, event({ ctrlKey: true }), false)).toBe(false);
		expect(
			matchesChord(
				ctrlAlt,
				event({ ctrlKey: true, altKey: true, shiftKey: true }),
				false,
			),
		).toBe(false);
	});

	it("ignores other keys and keyup", () => {
		const altN = chord("Alt+N");
		expect(
			matchesChord(altN, event({ altKey: true, code: "KeyM" }), false),
		).toBe(false);
		expect(
			matchesChord(altN, event({ altKey: true, type: "keyup" }), false),
		).toBe(false);
	});
});
