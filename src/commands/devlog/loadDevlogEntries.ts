import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_REPO_ROOT } from "./loadBlogSkipDays";
import type { DevlogEntry } from "./types";

const DEVLOG_DIR = join(BLOG_REPO_ROOT, "src/content/devlog");

type ParsedFrontmatter = {
	date: string;
	repoTag: string;
	version: string | null;
	title: string | null;
	filename: string;
};

function extractFrontmatter(content: string): string | null {
	const fm = content.match(/^---\n([\s\S]*?)\n---/);
	return fm?.[1] ?? null;
}

function matchField(frontmatter: string, pattern: RegExp): string | null {
	return frontmatter.match(pattern)?.[1]?.trim() ?? null;
}

function parseFrontmatter(
	content: string,
	filename: string,
): ParsedFrontmatter | null {
	const frontmatter = extractFrontmatter(content);
	if (!frontmatter) return null;

	const date = matchField(frontmatter, /date:\s*"?(\d{4}-\d{2}-\d{2})"?/);
	const tagsRaw = matchField(frontmatter, /tags:\s*\[([^\]]*)\]/);
	if (!date || !tagsRaw) return null;

	const repoTag = tagsRaw.split(",")[0]?.trim();
	if (!repoTag) return null;

	return {
		date,
		repoTag,
		version: matchField(frontmatter, /version:\s*(.+)/),
		title: matchField(frontmatter, /title:\s*(.+)/),
		filename,
	};
}

function readDevlogFiles(callback: (parsed: ParsedFrontmatter) => void): void {
	try {
		const files = readdirSync(DEVLOG_DIR).filter((f) => f.endsWith(".md"));

		for (const file of files) {
			const content = readFileSync(join(DEVLOG_DIR, file), "utf-8");
			const parsed = parseFrontmatter(content, file);
			if (parsed) callback(parsed);
		}
	} catch {
		// Directory doesn't exist or can't be read
	}
}

export function loadDevlogEntries(
	repoName: string,
): Map<string, DevlogEntry[]> {
	const entries = new Map<string, DevlogEntry[]>();

	readDevlogFiles((parsed) => {
		if (parsed.repoTag !== repoName) return;
		if (!parsed.version || !parsed.title) return;

		const existing = entries.get(parsed.date) || [];
		existing.push({
			version: parsed.version,
			title: parsed.title,
			filename: parsed.filename,
		});
		entries.set(parsed.date, existing);
	});

	return entries;
}

export function loadAllDevlogLatestDates(): Map<string, string> {
	const latest = new Map<string, string>();

	readDevlogFiles((parsed) => {
		const existing = latest.get(parsed.repoTag);
		if (!existing || parsed.date > existing) {
			latest.set(parsed.repoTag, parsed.date);
		}
	});

	return latest;
}
