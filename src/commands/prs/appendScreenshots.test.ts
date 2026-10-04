import { describe, expect, it } from "vitest";
import { appendScreenshots } from "./appendScreenshots";

describe("appendScreenshots", () => {
	it("returns the body unchanged when there are no screenshots", () => {
		expect(appendScreenshots("body", [])).toBe("body");
	});

	it("appends a ## Screenshots section referencing each staged path", () => {
		expect(
			appendScreenshots("body", [
				{ path: "/s/a.png", alt: "a" },
				{ path: "/s/b.mp4", alt: "b" },
			]),
		).toBe("body\n\n## Screenshots\n\n![a](/s/a.png)\n\n![b](/s/b.mp4)");
	});

	it("wraps a path containing spaces in angle brackets", () => {
		expect(
			appendScreenshots("body", [{ path: "C:/Users/A B/a.png", alt: "a" }]),
		).toBe("body\n\n## Screenshots\n\n![a](<C:/Users/A B/a.png>)");
	});
});
