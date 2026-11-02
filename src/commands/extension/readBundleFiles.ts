import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function readBundleFiles(dir: string): Map<string, Buffer> {
	const entries = readdirSync(dir, { recursive: true, withFileTypes: true });
	return new Map(
		entries
			.filter((entry) => entry.isFile())
			.map((entry) => {
				const path = join(entry.parentPath, entry.name);
				return [relative(dir, path).split(sep).join("/"), readFileSync(path)];
			}),
	);
}
