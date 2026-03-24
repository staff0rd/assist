import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Recursively find all .sln files under a directory, up to a given depth.
 */
function findSlnFiles(dir: string, maxDepth: number, depth = 0): string[] {
	if (depth > maxDepth) return [];
	const results: string[] = [];
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		if (
			entry.startsWith(".") ||
			entry === "node_modules" ||
			entry === "packages"
		)
			continue;
		const full = path.join(dir, entry);
		try {
			const stat = statSync(full);
			if (stat.isFile() && entry.endsWith(".sln")) {
				results.push(full);
			} else if (stat.isDirectory()) {
				results.push(...findSlnFiles(full, maxDepth, depth + 1));
			}
		} catch {
			// skip inaccessible entries
		}
	}
	return results;
}

/**
 * Find which .sln files reference a given .csproj.
 * Returns paths relative to repoRoot.
 */
export function findContainingSolutions(
	csprojPath: string,
	repoRoot: string,
): string[] {
	const csprojAbs = path.resolve(csprojPath);
	const csprojBasename = path.basename(csprojAbs);
	const slnFiles = findSlnFiles(repoRoot, 3);
	const matches: string[] = [];

	// .sln files reference projects like:
	//   Project("...") = "Name", "Some\Path\Project.csproj", "..."
	// We match on the basename to handle both slash styles.
	const pattern = new RegExp(`[\\\\"/]${escapeRegex(csprojBasename)}"`);

	for (const sln of slnFiles) {
		try {
			const content = readFileSync(sln, "utf-8");
			if (pattern.test(content)) {
				matches.push(path.relative(repoRoot, sln));
			}
		} catch {
			// skip unreadable files
		}
	}

	return matches;
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
