import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Handler } from "../../../shared/web";

const require = createRequire(import.meta.url);

export function createCssHandler(packageEntry: string): Handler {
	let cache: { body: string; etag: string } | undefined;
	return (req, res) => {
		if (!cache) {
			const resolved = require.resolve(packageEntry);
			const body = readFileSync(resolved, "utf8");
			const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`;
			cache = { body, etag };
		}
		const headers = { ETag: cache.etag, "Cache-Control": "no-cache" };
		if (req.headers["if-none-match"] === cache.etag) {
			res.writeHead(304, headers);
			res.end();
			return;
		}
		res.writeHead(200, { "Content-Type": "text/css", ...headers });
		res.end(cache.body);
	};
}
