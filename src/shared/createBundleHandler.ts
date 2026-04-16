import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Handler } from "./web";

export function createBundleHandler(
	importMetaUrl: string,
	bundlePath: string,
): Handler {
	const dir = dirname(fileURLToPath(importMetaUrl));
	let cache: string | undefined;
	return (_req, res) => {
		if (!cache) {
			cache = readFileSync(join(dir, bundlePath), "utf-8");
		}
		res.writeHead(200, { "Content-Type": "application/javascript" });
		res.end(cache);
	};
}
