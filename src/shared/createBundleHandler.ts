import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Handler } from "./web";

export function createBundleHandler(
	importMetaUrl: string,
	bundlePath: string,
): Handler {
	const dir = dirname(fileURLToPath(importMetaUrl));
	let cache: { body: string; etag: string } | undefined;
	return (req, res) => {
		if (!cache) {
			const body = readFileSync(join(dir, bundlePath), "utf8");
			const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`;
			cache = { body, etag };
		}
		// why: fixed /bundle.js URL means an upgraded CLI would otherwise serve the browser's cached old bundle; revalidate so newer UI appears
		const headers = {
			ETag: cache.etag,
			"Cache-Control": "no-cache",
		};
		if (req.headers["if-none-match"] === cache.etag) {
			res.writeHead(304, headers);
			res.end();
			return;
		}
		res.writeHead(200, {
			"Content-Type": "application/javascript",
			...headers,
		});
		res.end(cache.body);
	};
}
