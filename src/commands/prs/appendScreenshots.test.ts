import { describe, expect, it } from "vitest";
import { appendScreenshots } from "./appendScreenshots";

describe("appendScreenshots", () => {
	it("returns the body unchanged when there are no screenshots", () => {
		expect(appendScreenshots("body", [])).toBe("body");
	});

	it("appends a ## Screenshots section with the markdown joined", () => {
		expect(appendScreenshots("body", ["![a](u1)", "![b](u2)"])).toBe(
			"body\n\n## Screenshots\n\n![a](u1)\n\n![b](u2)",
		);
	});
});
