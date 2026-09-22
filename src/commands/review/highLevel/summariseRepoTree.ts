import { execFileSync } from "node:child_process";
import { dirname, extname } from "node:path";

const MAX_DIRECTORIES = 200;
const MAX_EXTENSIONS_PER_DIRECTORY = 6;

export function summariseRepoTree(cwd: string = process.cwd()): string {
	const directories = countByDirectory(listTrackedFiles(cwd));
	return [...directories.entries()]
		.map(([directory, extensions]) => ({
			directory,
			extensions: [...extensions.entries()].sort((a, b) => b[1] - a[1]),
			total: [...extensions.values()].reduce((sum, count) => sum + count, 0),
		}))
		.sort((a, b) => b.total - a.total || a.directory.localeCompare(b.directory))
		.slice(0, MAX_DIRECTORIES)
		.map(
			(entry) =>
				`${entry.directory} — ${entry.total} files: ${formatExtensions(entry.extensions)}`,
		)
		.join("\n");
}

function listTrackedFiles(cwd: string): string[] {
	try {
		return execFileSync("git", ["ls-files"], {
			cwd,
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		})
			.split("\n")
			.filter((line) => line !== "");
	} catch {
		return [];
	}
}

function countByDirectory(files: string[]): Map<string, Map<string, number>> {
	const directories = new Map<string, Map<string, number>>();
	for (const file of files) {
		const directory = dirname(file) === "." ? "(repo root)" : dirname(file);
		const extensions = directories.get(directory) ?? new Map<string, number>();
		const extension = extname(file) === "" ? "(no extension)" : extname(file);
		extensions.set(extension, (extensions.get(extension) ?? 0) + 1);
		directories.set(directory, extensions);
	}
	return directories;
}

function formatExtensions(extensions: [string, number][]): string {
	return extensions
		.slice(0, MAX_EXTENSIONS_PER_DIRECTORY)
		.map(([extension, count]) => `${extension}(${count})`)
		.join(", ");
}
