import fs from "node:fs";
import path from "node:path";

export function walkSourceFiles(dir: string, results: string[]): void {
	if (!fs.existsSync(dir)) {
		return;
	}
	const extensions = [".ts", ".tsx"];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== "node_modules" && entry.name !== ".git") {
				walkSourceFiles(fullPath, results);
			}
		} else if (
			entry.isFile() &&
			extensions.some((ext) => entry.name.endsWith(ext))
		) {
			results.push(fullPath);
		}
	}
}
