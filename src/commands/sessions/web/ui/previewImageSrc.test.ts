import { describe, expect, it } from "vitest";
import { previewImageSrc } from "./previewImageSrc";

const ASSET =
	"https://github.com/user-attachments/assets/039b4674-1960-4ce0-ab64-a4bd5d721ae9";

describe("previewImageSrc", () => {
	it("routes a GitHub attachment through the proxy, which holds the token", () => {
		expect(previewImageSrc(`![shot](${ASSET})`, "/repo")).toBe(
			`/api/pr-preview/image?url=${encodeURIComponent(ASSET)}&cwd=%2Frepo`,
		);
	});

	it("omits a cwd it was not given", () => {
		expect(previewImageSrc(ASSET, undefined)).toBe(
			`/api/pr-preview/image?url=${encodeURIComponent(ASSET)}`,
		);
	});

	it("leaves an already-public url alone", () => {
		expect(previewImageSrc("![shot](https://x/y.png)", "/repo")).toBe(
			"https://x/y.png",
		);
	});

	it("has nothing to show when the markdown carries no url", () => {
		expect(previewImageSrc("no link here", "/repo")).toBe("");
	});
});
