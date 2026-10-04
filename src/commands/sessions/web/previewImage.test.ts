import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const root = vi.hoisted(() => ({ dir: "" }));
vi.mock("../../../shared/stagedAttachmentsDir", () => ({
	get stagedAttachmentsDir() {
		return root.dir;
	},
}));

import { previewImage } from "./previewImage";

type MockRes = PassThrough & {
	status: number;
	headers: Record<string, unknown>;
	writeHead: (status: number, headers?: Record<string, unknown>) => MockRes;
};

function makeRes() {
	const res = new PassThrough() as MockRes;
	const chunks: Buffer[] = [];
	res.on("data", (c: Buffer) => chunks.push(c));
	res.status = 0;
	res.headers = {};
	res.writeHead = (status, headers) => {
		res.status = status;
		Object.assign(res.headers, headers ?? {});
		return res;
	};
	const done = new Promise<Buffer>((resolve) =>
		res.on("end", () => resolve(Buffer.concat(chunks))),
	);
	return { res: res as MockRes & ServerResponse, done };
}

function request(path: string): IncomingMessage {
	return {
		url: `/api/pr-preview/image?path=${encodeURIComponent(path)}`,
	} as IncomingMessage;
}

describe("previewImage", () => {
	beforeEach(async () => {
		root.dir = await mkdtemp(join(tmpdir(), "assist-staged-"));
	});

	afterEach(async () => {
		await rm(root.dir, { recursive: true, force: true });
	});

	it("serves a staged file with its content type", async () => {
		await mkdir(join(root.dir, "upload-a"));
		const file = join(root.dir, "upload-a", "clip.mp4");
		await writeFile(file, Buffer.from([1, 2, 3]));
		const { res, done } = makeRes();

		await previewImage(request(file), res);

		expect(res.status).toBe(200);
		expect(res.headers["Content-Type"]).toBe("video/mp4");
		expect(await done).toEqual(Buffer.from([1, 2, 3]));
	});

	it("refuses a path outside the staging dir", async () => {
		const { res } = makeRes();
		await previewImage(request(join(root.dir, "..", "secret.png")), res);
		expect(res.status).toBe(400);
	});

	it("reports a staged file that has since been removed", async () => {
		const { res } = makeRes();
		await previewImage(request(join(root.dir, "upload-a", "gone.png")), res);
		expect(res.status).toBe(404);
	});
});
