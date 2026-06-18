import { mkdtempSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { createBundleHandler } from "./createBundleHandler";

function createRes() {
	let statusCode = 0;
	let headers: Record<string, string> = {};
	let body: string | undefined;
	const res = {
		writeHead: (status: number, h: Record<string, string>) => {
			statusCode = status;
			headers = h;
			return res;
		},
		end: (chunk?: string) => {
			body = chunk;
			return res;
		},
	} as unknown as ServerResponse;
	return {
		res,
		status: () => statusCode,
		headers: () => headers,
		body: () => body,
	};
}

function createHandler(contents: string) {
	const dir = mkdtempSync(join(tmpdir(), "bundle-"));
	writeFileSync(join(dir, "bundle.js"), contents);
	const importMetaUrl = pathToFileURL(join(dir, "handler.js")).href;
	return createBundleHandler(importMetaUrl, "bundle.js");
}

describe("createBundleHandler", () => {
	it("serves the bundle with a content-hashed ETag and no-cache", () => {
		const handler = createHandler("console.log('hi')");
		const { res, status, headers, body } = createRes();

		handler({ headers: {} } as IncomingMessage, res);

		expect(status()).toBe(200);
		expect(body()).toBe("console.log('hi')");
		expect(headers()["Cache-Control"]).toBe("no-cache");
		expect(headers().ETag).toMatch(/^"[0-9a-f]{16}"$/);
	});

	describe("when the request's If-None-Match matches the current bundle", () => {
		it("responds 304 with no body so the browser reuses its cached copy", () => {
			const handler = createHandler("console.log('hi')");
			const first = createRes();
			handler({ headers: {} } as IncomingMessage, first.res);
			const etag = first.headers().ETag;

			const second = createRes();
			handler(
				{ headers: { "if-none-match": etag } } as unknown as IncomingMessage,
				second.res,
			);

			expect(second.status()).toBe(304);
			expect(second.body()).toBeUndefined();
		});
	});

	describe("when the request's If-None-Match is stale", () => {
		it("serves the full current bundle", () => {
			const handler = createHandler("console.log('hi')");
			const { res, status, body } = createRes();

			handler(
				{
					headers: { "if-none-match": '"deadbeefdeadbeef"' },
				} as unknown as IncomingMessage,
				res,
			);

			expect(status()).toBe(200);
			expect(body()).toBe("console.log('hi')");
		});
	});
});
