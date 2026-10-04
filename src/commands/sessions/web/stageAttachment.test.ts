import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const root = vi.hoisted(() => ({ dir: "" }));
vi.mock("../../../shared/stagedAttachmentsDir", () => ({
	get stagedAttachmentsDir() {
		return root.dir;
	},
}));

import { stageAttachment } from "./stageAttachment";

root.dir = join(tmpdir(), `staged-${process.pid}-${Date.now()}`);

async function write(name: string, contentType: string) {
	const { filePath, alt } = await stageAttachment(
		name,
		contentType,
		Buffer.from([1, 2, 3]),
	);
	return { filePath, alt, fileName: basename(filePath) };
}

afterEach(async () => {
	await rm(root.dir, { recursive: true, force: true });
});

describe("stageAttachment", () => {
	it("stages each upload in its own dir under the staging root", async () => {
		const a = await write("shot.png", "image/png");
		const b = await write("shot.png", "image/png");
		expect(dirname(dirname(a.filePath))).toBe(root.dir);
		expect(dirname(a.filePath)).not.toBe(dirname(b.filePath));
	});

	it("uses the sanitised base name as alt text", async () => {
		expect((await write("my shot!.png", "image/png")).alt).toBe("my-shot");
	});

	it("writes the body to the staged file", async () => {
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
		["image/jpeg", "jpg"],
	])("names an unnamed %s upload .%s", async (contentType, ext) => {
		const { fileName } = await write("", contentType);
		expect(fileName).toBe(`screenshot.${ext}`);
	});

	it("derives the extension from an unlisted content type", async () => {
		const { fileName } = await write("", "image/x-png; charset=binary");
		expect(fileName).toBe("screenshot.png");
	});

	it.each([
		["clip.ogv", "video/ogg"],
		["", "image/bmp"],
	])("refuses %s (%s), which gh cannot attach", async (name, contentType) => {
		await expect(write(name, contentType)).rejects.toThrow(
			/gh cannot attach \.(ogv|bmp) files/,
		);
	});

	it("falls back to png when the content type says nothing usable", async () => {
		expect((await write("", "")).fileName).toBe("screenshot.png");
		expect((await write("", "application/octet-stream")).fileName).toBe(
			"screenshot.png",
		);
	});
});
