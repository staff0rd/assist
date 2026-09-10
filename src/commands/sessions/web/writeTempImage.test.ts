import { readFile, rm } from "node:fs/promises";
import { basename } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeTempImage } from "./writeTempImage";

const dirs: string[] = [];

async function write(name: string, contentType: string) {
	const { dir, filePath } = await writeTempImage(
		name,
		contentType,
		Buffer.from([1, 2, 3]),
	);
	dirs.push(dir);
	return { filePath, fileName: basename(filePath) };
}

afterEach(async () => {
	await Promise.all(
		dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })),
	);
});

describe("writeTempImage", () => {
	it("writes the body to the temp file", async () => {
		const { filePath } = await write("shot.png", "image/png");
		expect(await readFile(filePath)).toEqual(Buffer.from([1, 2, 3]));
	});

	it("keeps the extension from the file name", async () => {
		const { fileName } = await write("clip.mp4", "video/mp4");
		expect(fileName).toBe("clip.mp4");
	});

	it.each([
		["video/mp4", "mp4"],
		["video/webm", "webm"],
		["video/quicktime", "mov"],
		["video/ogg", "ogv"],
		["image/jpeg", "jpg"],
	])("names an unnamed %s upload .%s", async (contentType, ext) => {
		const { fileName } = await write("", contentType);
		expect(fileName).toBe(`screenshot.${ext}`);
	});

	it("derives the extension from an unlisted content type", async () => {
		const { fileName } = await write("", "video/x-m4v; codecs=avc1");
		expect(fileName).toBe("screenshot.m4v");
	});

	it("falls back to png when the content type says nothing usable", async () => {
		expect((await write("", "")).fileName).toBe("screenshot.png");
		expect((await write("", "application/octet-stream")).fileName).toBe(
			"screenshot.png",
		);
	});
});
