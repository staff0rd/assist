import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_REPO_ROOT } from "../loadBlogSkipWeeks";

const DEVLOG_DIR = join(BLOG_REPO_ROOT, "src/content/devlog");

function readMarkdownFiles(dir: string): string[] {
	try {
		return readdirSync(dir).filter((file) => file.endsWith(".md"));
	} catch {
		return [];
	}
}

function parseDateForRepo(content: string, repoName: string): string | null {
	const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1];
	if (!frontmatter) return null;
	const date = frontmatter.match(/date:\s*"?(\d{4}-\d{2}-\d{2})"?/)?.[1];
	const repoTag = frontmatter.match(/tags:\s*\[([^,\]]*)/)?.[1]?.trim();
	return date && repoTag === repoName ? date : null;
}

export function loadLastDailyDevlogDate(
	repoName: string,
	devlogDir = DEVLOG_DIR,
): string | null {
	let latest: string | null = null;
	for (const file of readMarkdownFiles(devlogDir)) {
		const content = readFileSync(join(devlogDir, file), "utf8");
		const date = parseDateForRepo(content, repoName);
		if (date && (!latest || date > latest)) latest = date;
	}
	return latest;
}
