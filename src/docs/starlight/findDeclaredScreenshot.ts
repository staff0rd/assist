import type { DocsScreenshot } from "../docsPageSchema";
import { docsPaths } from "../docsPaths";
import { loadDocsPages } from "../loadDocsPages";

export function findDeclaredScreenshot(
	file: string,
	pagesDir = docsPaths.pagesDir,
): DocsScreenshot | undefined {
	return loadDocsPages(pagesDir)
		.flatMap((page) => page.screenshots ?? [])
		.find((screenshot) => screenshot.file === file);
}
