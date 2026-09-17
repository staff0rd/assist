import { describe, expect, it } from "vitest";
import { screenshotPreviewUrl } from "./screenshotPreviewUrl";

describe("screenshotPreviewUrl", () => {
	it("takes the target out of image markdown", () => {
		expect(screenshotPreviewUrl("![shot](https://x/y.png)")).toBe(
			"https://x/y.png",
		);
	});

	it("ignores a title after the target", () => {
		expect(screenshotPreviewUrl('![shot](https://x/y.png "A shot")')).toBe(
			"https://x/y.png",
		);
	});

	it("unwraps an angle-bracketed target", () => {
		expect(screenshotPreviewUrl("![shot](<https://x/y.png>)")).toBe(
			"https://x/y.png",
		);
	});

	it("takes a linked image's own target, not the link's", () => {
		expect(
			screenshotPreviewUrl("[![shot](https://x/y.png)](https://x/full.png)"),
		).toBe("https://x/y.png");
	});

	it("falls back to a bare url", () => {
		expect(screenshotPreviewUrl("https://x/y.png")).toBe("https://x/y.png");
	});

	it("returns nothing when there is no url to show", () => {
		expect(screenshotPreviewUrl("no link here")).toBe("");
	});
});
