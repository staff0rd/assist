import { describe, expect, it } from "vitest";
import { parseChord } from "./parseChord";

describe("parseChord", () => {
	it("parses a modifier and a letter onto its event.code", () => {
		expect(parseChord("Alt+S")).toEqual({
			ok: true,
			chord: { modifiers: ["Alt"], key: { code: "KeyS", label: "S" } },
		});
	});

	it("orders modifiers canonically and ignores case and spacing", () => {
		expect(parseChord(" shift + ctrl + k ")).toEqual({
			ok: true,
			chord: {
				modifiers: ["Ctrl", "Shift"],
				key: { code: "KeyK", label: "K" },
			},
		});
	});

	it("accepts Mod, macOS modifier names, digits, punctuation and named keys", () => {
		const parsed = ["Mod+/", "Cmd+1", "Option+.", "Ctrl+F5", "Alt+arrowup"].map(
			(text) => parseChord(text),
		);

		expect(
			parsed.map((result) =>
				result.ok
					? [...result.chord.modifiers, result.chord.key?.code].join(" ")
					: result.error,
			),
		).toEqual([
			"Mod Slash",
			"Meta Digit1",
			"Alt Period",
			"Ctrl F5",
			"Alt ArrowUp",
		]);
	});

	it("parses modifiers alone when asked to", () => {
		expect(parseChord("Ctrl+Alt", { modifiersOnly: true })).toEqual({
			ok: true,
			chord: { modifiers: ["Ctrl", "Alt"] },
		});
	});

	it.each([
		["J", "needs at least one of"],
		["Shift+J", "needs at least one of"],
		["Hyper+J", '"Hyper" is not a modifier'],
		["Alt+Alt+J", '"Alt" is repeated'],
		["Alt+NotAKey", '"NotAKey" is not a key'],
		["Alt+", '"" is not a key'],
		["Mod+Ctrl+J", "combines Mod with Ctrl or Meta"],
	])("rejects %s", (text, error) => {
		const result = parseChord(text);
		expect(result.ok).toBe(false);
		expect(result.ok ? "" : result.error).toContain(error);
	});

	it("rejects a key in a modifiers-only chord", () => {
		const result = parseChord("Alt+1", { modifiersOnly: true });
		expect(result.ok ? "" : result.error).toContain('"1" is not a modifier');
	});
});
