import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { parseScreenshotSpec } from "./parseScreenshotSpec";

let dir: string;
let png: string;

beforeAll(() => {
	dir = mkdtempSync(join(tmpdir(), "screenshot-spec-"));
	png = join(dir, "profile-light.png");
	writeFileSync(png, "");
	writeFileSync(join(dir, "notes.txt"), "");
});

describe("parseScreenshotSpec", () => {
	it("splits group and caption from the path", () => {
		expect(parseScreenshotSpec(`Profile/Career Connect light=${png}`)).toEqual({
			path: png,
			alt: "Career Connect light",
			group: "Profile",
		});
	});

	it("splits only on the first = and first /", () => {
		expect(parseScreenshotSpec(`A/b/c=${png}`)).toEqual({
			path: png,
			alt: "b/c",
			group: "A",
		});
	});

	it("leaves the attachment ungrouped without a /", () => {
		expect(parseScreenshotSpec(`Light=${png}`)).toEqual({
			path: png,
			alt: "Light",
		});
	});

	it("falls back to the file's base name without a caption", () => {
		expect(parseScreenshotSpec(`Profile/=${png}`)).toEqual({
			path: png,
			alt: "profile-light",
			group: "Profile",
		});
		expect(parseScreenshotSpec(png)).toEqual({
			path: png,
			alt: "profile-light",
		});
	});

	it("names the spec when the file is missing", () => {
		const spec = `X=${join(dir, "missing.png")}`;
		expect(() => parseScreenshotSpec(spec)).toThrow(
			`--screenshot '${spec}': file not found`,
		);
	});

	it("names the spec when gh cannot attach the extension", () => {
		const spec = `X=${join(dir, "notes.txt")}`;
		expect(() => parseScreenshotSpec(spec)).toThrow(
			`--screenshot '${spec}': gh cannot attach .txt files`,
		);
	});
});
