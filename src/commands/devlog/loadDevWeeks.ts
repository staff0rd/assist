import { readdirSync } from "node:fs";
import { join } from "node:path";
import { BLOG_REPO_ROOT } from "./loadBlogSkipDays";

const DEV_DIR = join(BLOG_REPO_ROOT, "src/content/dev");

const DEV_FILENAME_PATTERN = /^(\d{4})-w(\d{2})\.md$/;

export function parseDevWeekFilename(filename: string): string | null {
	const match = filename.match(DEV_FILENAME_PATTERN);
	return match ? `${match[1]}-W${match[2]}` : null;
}

function readFilenames(dir: string): string[] {
	try {
		return readdirSync(dir);
	} catch {
		return [];
	}
}

export function loadDevWeeks(repoName: string, devDir = DEV_DIR): string[] {
	return readFilenames(join(devDir, repoName))
		.map(parseDevWeekFilename)
		.filter((week): week is string => week !== null)
		.sort();
}
