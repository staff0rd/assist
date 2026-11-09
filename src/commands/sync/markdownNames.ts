import * as fs from "node:fs";
import * as path from "node:path";

export function markdownNames(dir: string): string[] {
	return fs
		.readdirSync(dir)
		.filter((file) => file.endsWith(".md"))
		.map((file) => path.basename(file, ".md"));
}
