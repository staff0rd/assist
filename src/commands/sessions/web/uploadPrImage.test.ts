import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const runGhImageMock = vi.fn();
vi.mock("./runGhImage", () => ({
	runGhImage: (...args: unknown[]) => runGhImageMock(...args),
	GH_IMAGE_INSTALL_COMMAND: "gh extension install drogers0/gh-image",
	GhImageUnavailableError: class GhImageUnavailableError extends Error {
		name = "GhImageUnavailableError";
	},
}));

import { GhImageUnavailableError } from "./runGhImage";
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
		runGhImageMock.mockReset();
	});

	it("hosts the image and returns its markdown", async () => {
		runGhImageMock.mockResolvedValue("![shot](https://x/y.png)");
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
		expect(res.body).toEqual({ markdown: "![shot](https://x/y.png)" });
		expect(runGhImageMock).toHaveBeenCalledWith(expect.any(String), "/repo");
	});

	it("rejects a request with no cwd", async () => {
		const res = makeRes();
		await uploadPrImage(
			makeReq("/api/pr-preview/upload-image", "image/png", Buffer.from([1])),
			res,
		);
		expect(res.status).toBe(400);
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

	it("rejects a video over 100MB before running gh image", async () => {
		runGhImageMock.mockResolvedValue("https://x/y.mp4");
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
		expect(runGhImageMock).not.toHaveBeenCalled();
	});

	it("accepts a 14MB video", async () => {
		runGhImageMock.mockResolvedValue("https://x/y.mp4");
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
		expect(res.body).toEqual({ markdown: "https://x/y.mp4" });
	});

	it("keeps the 25MB cap for images", async () => {
		runGhImageMock.mockResolvedValue("![shot](https://x/y.png)");
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo&name=shot.png",
				"image/png",
				Buffer.alloc(11 * 1024 * 1024),
			),
			res,
		);
		expect(res.status).toBe(200);

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

	it("returns 501 when gh-image is unavailable", async () => {
		runGhImageMock.mockRejectedValue(new GhImageUnavailableError("install it"));
		const res = makeRes();
		await uploadPrImage(
			makeReq(
				"/api/pr-preview/upload-image?cwd=/repo",
				"image/png",
				Buffer.from([1]),
			),
			res,
		);
		expect(res.status).toBe(501);
		const body = res.body as { error: string; command: string };
		expect(body.error).toContain("install it");
		expect(body.command).toBe("gh extension install drogers0/gh-image");
	});
});
