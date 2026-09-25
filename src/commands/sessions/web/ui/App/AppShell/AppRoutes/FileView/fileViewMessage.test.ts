import { describe, expect, it } from "vitest";
import { fileViewMessage } from "./fileViewMessage";

describe("fileViewMessage", () => {
	it("asks for a repo before anything else", () => {
		expect(fileViewMessage("absent", "src/a.ts", "")).toBe(
			"Select a repo to view files.",
		);
	});

	it("reports a missing path", () => {
		expect(fileViewMessage("error", "", "/repo")).toBe("No file path given.");
	});

	it("reports a missing file", () => {
		expect(fileViewMessage("absent", "src/a.ts", "/repo")).toBe(
			"This file is not in the working tree.",
		);
	});

	it("reports an oversized file", () => {
		expect(fileViewMessage("too-large", "src/a.ts", "/repo")).toBe(
			"This file is too large to display (over 2 MB).",
		);
	});

	it("falls back to a generic failure", () => {
		expect(fileViewMessage("error", "src/a.ts", "/repo")).toBe(
			"Couldn't load this file.",
		);
	});
});
