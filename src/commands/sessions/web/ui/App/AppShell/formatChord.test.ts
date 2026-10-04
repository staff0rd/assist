import { describe, expect, it } from "vitest";
import { formatChord } from "./formatChord";

describe("formatChord", () => {
	it("joins key names with + off macOS", () => {
		expect(formatChord(["Alt", "1"], false)).toBe("Alt+1");
		expect(formatChord(["Ctrl", "."], false)).toBe("Ctrl+.");
		expect(formatChord(["Mod", "/"], false)).toBe("Ctrl+/");
		expect(formatChord(["Shift", "Tab"], false)).toBe("Shift+Tab");
	});

	it("uses glyphs without separators on macOS", () => {
		expect(formatChord(["Alt", "1"], true)).toBe("⌥1");
		expect(formatChord(["Ctrl", "N"], true)).toBe("⌃N");
		expect(formatChord(["Mod", "/"], true)).toBe("⌘/");
		expect(formatChord(["Shift", "Tab"], true)).toBe("⇧Tab");
	});
});
