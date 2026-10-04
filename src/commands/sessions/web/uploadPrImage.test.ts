import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const stageAttachmentMock = vi.fn();
vi.mock("./stageAttachment", () => ({
	stageAttachment: (...args: unknown[]) => stageAttachmentMock(...args),
}));

import { uploadPrImage } from "./uploadPrImage";

function makeReq(
	url: string,
	contentType: string,
	body: Buffer,
): IncomingMessage {
	return {
		url,
		headers: { "content-type": contentType },
		destroy: () => {},
		async *[Symbol.asyncIterator]() {
			yield body;
		},
	} as unknown as IncomingMessage;
}

function makeRes() {
	const res = {
		status: 0,
		body: null as unknown,
		writeHead(status: number) {
			res.status = status;
			return res;
		},
		end(payload?: string) {
			res.body = payload ? JSON.parse(payload) : null;
		},
	};
	return res as typeof res & ServerResponse;
}

describe("uploadPrImage", () => {
	beforeEach(() => {
		stageAttachmentMock.mockReset().mockResolvedValue({
			dir: "/s/u",
			filePath: "/s/u/shot.png",
			alt: "shot",
		});
	});

	it("stages the file locally and returns its path and alt text", async () => {
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo&name=shot.png",
				"image/png",
				Buffer.from([1, 2, 3]),
			),
			res,
		);
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ path: "/s/u/shot.png", alt: "shot" });
		expect(stageAttachmentMock).toHaveBeenCalledWith(
			"shot.png",
			"image/png",
			Buffer.from([1, 2, 3]),
		);
	});

	it("rejects an empty upload", async () => {
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo",
				"image/png",
				Buffer.alloc(0),
			),
			res,
		);
		expect(res.status).toBe(400);
		expect((res.body as { error: string }).error).toContain("Empty");
	});

	it("rejects a video over 100MB before staging it", async () => {
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo&name=clip.mp4",
				"video/mp4",
				Buffer.alloc(100 * 1024 * 1024 + 1),
			),
			res,
		);
		expect(res.status).toBe(413);
		expect((res.body as { error: string }).error).toBe(
			"Video too large (max 100MB).",
		);
		expect(stageAttachmentMock).not.toHaveBeenCalled();
	});

	it("accepts a 14MB video", async () => {
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo&name=clip.mov",
				"video/quicktime",
				Buffer.alloc(14 * 1024 * 1024),
			),
			res,
		);
		expect(res.status).toBe(200);
	});

	it("keeps the 25MB cap for images", async () => {
		const tooBig = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo&name=shot.png",
				"image/png",
				Buffer.alloc(25 * 1024 * 1024 + 1),
			),
			tooBig,
		);
		expect(tooBig.status).toBe(413);
		expect((tooBig.body as { error: string }).error).toBe(
			"Image too large (max 25MB).",
		);
	});

	it("reports a staging failure", async () => {
		stageAttachmentMock.mockRejectedValue(new Error("disk full"));
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo",
				"image/png",
				Buffer.from([1]),
			),
			res,
		);
		expect(res.status).toBe(500);
		expect((res.body as { error: string }).error).toBe("disk full");
	});
});
