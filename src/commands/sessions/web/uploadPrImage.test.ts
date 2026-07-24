import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";

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
