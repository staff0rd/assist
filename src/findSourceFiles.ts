import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".ts", ".tsx"];

export function findSourceFiles(dir: string): string[] {
	const results: string[] = [];

	if (!fs.existsSync(dir)) {
		return results;
	}

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			results.push(...findSourceFiles(fullPath));
		} else if (
			entry.isFile() &&
			EXTENSIONS.some((ext) => entry.name.endsWith(ext))
		) {
			results.push(fullPath);
		}
	}

	return results;
}
