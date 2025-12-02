import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".ts", ".tsx"];

type FindSourceFilesOptions = {
	includeTests?: boolean;
};

export function findSourceFiles(
	dir: string,
	options: FindSourceFilesOptions = {},
): string[] {
	const { includeTests = true } = options;
	const results: string[] = [];

	if (!fs.existsSync(dir)) {
		return results;
	}

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			results.push(...findSourceFiles(fullPath, options));
		} else if (
			entry.isFile() &&
			EXTENSIONS.some((ext) => entry.name.endsWith(ext))
		) {
			if (!includeTests && entry.name.includes(".test.")) {
				continue;
			}
			results.push(fullPath);
		}
	}

	return results;
}
