import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readDocsFrontmatter } from "../../../docs/readDocsFrontmatter";
import { darkVariantFile } from "../../../docs/screenshotVariants";

type LooseShot = { file?: unknown; theme?: unknown };

function pageScreenshots(text: string): LooseShot[] {
	try {
		const frontmatter = readDocsFrontmatter(text) as {
			screenshots?: unknown;
		} | null;
		const shots = frontmatter?.screenshots;
		return Array.isArray(shots) ? (shots as LooseShot[]) : [];
	} catch {
		return [];
	}
}

export function listDeclaredScreenshots(pagesDir: string): Set<string> {
	const declared = new Set<string>();
	if (!existsSync(pagesDir)) return declared;
	for (const name of readdirSync(pagesDir)) {
		if (!/\.mdx?$/.test(name)) continue;
		for (const shot of pageScreenshots(
			readFileSync(join(pagesDir, name), "utf8"),
		)) {
			if (typeof shot.file !== "string") continue;
			declared.add(shot.file);
			if (!shot.theme) declared.add(darkVariantFile(shot.file));
		}
	}
	return declared;
}
