import fs from "node:fs";
import path from "node:path";
import { projectIncludesFile } from "./projectIncludesFile";

export function findEnclosingTsConfig(
	sourcePath: string,
	rootDir: string,
	tried: Set<string>,
): string | undefined {
	let dir = path.dirname(sourcePath);
	while (dir.startsWith(rootDir + path.sep) && dir !== rootDir) {
		const nested = path.join(dir, "tsconfig.json");
		if (!tried.has(nested)) {
			tried.add(nested);
			if (fs.existsSync(nested) && projectIncludesFile(nested, sourcePath)) {
				return nested;
			}
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return undefined;
}
