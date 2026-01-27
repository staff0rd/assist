import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { DevlogEntry } from "./types";

const DEVLOG_DIR = join(homedir(), "git/blog/src/content/devlog");

export function loadDevlogEntries(
	repoName: string,
): Map<string, DevlogEntry[]> {
	const entries = new Map<string, DevlogEntry[]>();

	try {
		const files = readdirSync(DEVLOG_DIR).filter((f) => f.endsWith(".md"));

		for (const file of files) {
			const content = readFileSync(join(DEVLOG_DIR, file), "utf-8");
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

			if (frontmatterMatch) {
				const frontmatter = frontmatterMatch[1];
				const dateMatch = frontmatter.match(/date:\s*"?(\d{4}-\d{2}-\d{2})"?/);
				const versionMatch = frontmatter.match(/version:\s*(.+)/);
				const titleMatch = frontmatter.match(/title:\s*(.+)/);
				const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);

				if (dateMatch && versionMatch && titleMatch && tagsMatch) {
					const tags = tagsMatch[1].split(",").map((t) => t.trim());
					const firstTag = tags[0];

					if (firstTag !== repoName) {
						continue;
					}

					const date = dateMatch[1];
					const version = versionMatch[1].trim();
					const title = titleMatch[1].trim();

					const existing = entries.get(date) || [];
					existing.push({ version, title, filename: file });
					entries.set(date, existing);
				}
			}
		}
	} catch {
		// Directory doesn't exist or can't be read
	}

	return entries;
}
