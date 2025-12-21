import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { AssistConfig, DevlogEntry } from "./types";

export const DEVLOG_DIR = join(homedir(), "git/blog/src/content/devlog");

export function loadConfig(): AssistConfig {
	const configPath = join(process.cwd(), "assist.yml");
	if (!existsSync(configPath)) {
		return {};
	}
	try {
		const content = readFileSync(configPath, "utf-8");
		return parseYaml(content) || {};
	} catch {
		return {};
	}
}

export function getRepoName(): string {
	const packageJsonPath = join(process.cwd(), "package.json");
	if (existsSync(packageJsonPath)) {
		try {
			const content = readFileSync(packageJsonPath, "utf-8");
			const pkg = JSON.parse(content);
			if (pkg.name) {
				return pkg.name;
			}
		} catch {
			// Fall through to directory name
		}
	}
	return basename(process.cwd());
}

export function getCommitFiles(hash: string): string[] {
	try {
		const output = execSync(`git show --name-only --format="" ${hash}`, {
			encoding: "utf-8",
		});
		return output.trim().split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

export function shouldIgnoreCommit(
	files: string[],
	ignorePaths: string[],
): boolean {
	if (ignorePaths.length === 0 || files.length === 0) {
		return false;
	}
	return files.every((file) =>
		ignorePaths.some((ignorePath) => file.startsWith(ignorePath)),
	);
}

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
