import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const MANIFEST = ".build-files";

function listFiles(root: string, dir = root): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return listFiles(root, path);
		return [relative(root, path).split("\\").join("/")];
	});
}

function readManifest(target: string): Set<string> | undefined {
	try {
		const text = readFileSync(join(target, MANIFEST), "utf8");
		return new Set(text.split("\n").filter(Boolean));
	} catch {
		return undefined;
	}
}

type Rename = (from: string, to: string) => void;

function moveInto(
	rename: Rename,
	staging: string,
	target: string,
	file: string,
): void {
	const to = join(target, file);
	mkdirSync(dirname(to), { recursive: true });
	rename(join(staging, file), to);
}

function prune(target: string, keep: Set<string>): void {
	for (const file of listFiles(target))
		if (file !== MANIFEST && !keep.has(file))
			rmSync(join(target, file), { force: true });
}

/* why: renaming each staged file over its old copy keeps every path loadable
 * throughout the swap — the entry point goes last so it never imports a chunk
 * that has not landed yet, and the previous build's hashed chunks stay until
 * the next swap for processes that lazy-import them after this one. */
export function swapBuildDir(
	staging: string,
	target: string,
	entry = "index.js",
	rename: Rename = renameSync,
): void {
	const files = listFiles(staging);
	const previous = existsSync(target)
		? (readManifest(target) ?? new Set(listFiles(target)))
		: new Set<string>();
	for (const file of files)
		if (file !== entry) moveInto(rename, staging, target, file);
	if (files.includes(entry)) moveInto(rename, staging, target, entry);
	prune(target, new Set([...files, ...previous]));
	const manifest = join(target, `${MANIFEST}.tmp`);
	writeFileSync(manifest, `${files.join("\n")}\n`);
	rename(manifest, join(target, MANIFEST));
	rmSync(staging, { recursive: true, force: true });
}
