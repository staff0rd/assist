import { describe, expect, it } from "vitest";
import { imageFromClipboard, imageFromDrop } from "./imageFromClipboard";

function clipboard(
	items: { kind: string; type: string; file?: File }[],
): DataTransfer {
	return {
		items: items.map((i) => ({
			kind: i.kind,
			type: i.type,
			getAsFile: () => i.file ?? null,
		})),
	} as unknown as DataTransfer;
}

function drop(files: File[]): DataTransfer {
	return { files } as unknown as DataTransfer;
}

const png = new File([new Uint8Array([1])], "shot.png", { type: "image/png" });
const mp4 = new File([new Uint8Array([1])], "clip.mp4", { type: "video/mp4" });
const mov = new File([new Uint8Array([1])], "", { type: "video/quicktime" });
const text = new File([new Uint8Array([1])], "notes.txt", {
	type: "text/plain",
});

describe("imageFromClipboard", () => {
	it("takes a pasted image", () => {
		expect(
			imageFromClipboard(
				clipboard([{ kind: "file", type: "image/png", file: png }]),
			),
		).toBe(png);
	});

	it("takes a pasted mp4", () => {
		expect(
			imageFromClipboard(
				clipboard([{ kind: "file", type: "video/mp4", file: mp4 }]),
			),
		).toBe(mp4);
	});

	it("takes a pasted quicktime screen recording", () => {
		expect(
			imageFromClipboard(
				clipboard([{ kind: "file", type: "video/quicktime", file: mov }]),
			),
		).toBe(mov);
	});

	it("ignores non-media files and plain text", () => {
		expect(
			imageFromClipboard(
				clipboard([
					{ kind: "string", type: "text/plain" },
					{ kind: "file", type: "text/plain", file: text },
				]),
			),
		).toBeNull();
	});

	it("returns null without clipboard data", () => {
		expect(imageFromClipboard(null)).toBeNull();
	});
});

describe("imageFromDrop", () => {
	it("takes a dropped image", () => {
		expect(imageFromDrop(drop([png]))).toBe(png);
	});

	it("takes a dropped mp4", () => {
		expect(imageFromDrop(drop([mp4]))).toBe(mp4);
	});

	it("skips past a non-media file to the video", () => {
		expect(imageFromDrop(drop([text, mp4]))).toBe(mp4);
	});

	it("ignores a drop with no media", () => {
		expect(imageFromDrop(drop([text]))).toBeNull();
	});

	it("returns null without drop data", () => {
		expect(imageFromDrop(null)).toBeNull();
	});
});
