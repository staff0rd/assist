import { describe, expect, it } from "vitest";
import { filePaletteMessage } from "./filePaletteMessage";

const idle = { files: [], loading: false, error: false };

describe("filePaletteMessage", () => {
	it("asks for a repo when none is selected", () => {
		expect(filePaletteMessage("", "a", idle)).toBe(
			"Select a repo to search files.",
		);
	});

	it("reports a failed search", () => {
		expect(filePaletteMessage("/repo", "a", { ...idle, error: true })).toBe(
			"Couldn't search files in this repo.",
		);
	});

	it("reports no matches for a query", () => {
		expect(filePaletteMessage("/repo", "zzz", idle)).toBe("No matching files.");
	});

	it("reports an empty repo when there is no query", () => {
		expect(filePaletteMessage("/repo", "", idle)).toBe(
			"No files in this repo.",
		);
	});

	it("stays silent while results are present or loading", () => {
		expect(
			filePaletteMessage("/repo", "a", { ...idle, files: ["src/a.ts"] }),
		).toBeUndefined();
		expect(
			filePaletteMessage("/repo", "a", { ...idle, loading: true }),
		).toBeUndefined();
	});
});
