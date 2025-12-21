import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import chalk from "chalk";
import { parse as parseYaml } from "yaml";

type DiffOptions = {
	days?: number;
	ignore?: string[];
	verbose?: boolean;
};

type DevlogEntry = {
	version: string;
	title: string;
};

type AssistConfig = {
	devlog?: {
		diff?: {
			ignore?: string[];
		};
	};
};

function loadConfig(): AssistConfig {
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

function loadDevlogEntries(repoName: string): Map<string, DevlogEntry[]> {
	const devlogDir = join(homedir(), "git/blog/src/content/devlog");
	const entries = new Map<string, DevlogEntry[]>();

	try {
		const files = readdirSync(devlogDir).filter((f) => f.endsWith(".md"));

		for (const file of files) {
			const content = readFileSync(join(devlogDir, file), "utf-8");
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
					existing.push({ version, title });
					entries.set(date, existing);
				}
			}
		}
	} catch {
		// Directory doesn't exist or can't be read
	}

	return entries;
}

function getCommitFiles(hash: string): string[] {
	try {
		const output = execSync(`git show --name-only --format="" ${hash}`, {
			encoding: "utf-8",
		});
		return output.trim().split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

function shouldIgnoreCommit(files: string[], ignorePaths: string[]): boolean {
	if (ignorePaths.length === 0 || files.length === 0) {
		return false;
	}
	return files.every((file) =>
		ignorePaths.some((ignorePath) => file.startsWith(ignorePath)),
	);
}

type Commit = {
	date: string;
	hash: string;
	message: string;
	files: string[];
};

export function diff(options: DiffOptions): void {
	const config = loadConfig();
	const days = options.days ?? 30;
	const ignore = options.ignore ?? config.devlog?.diff?.ignore ?? [];
	const repoName = basename(process.cwd());
	const devlogEntries = loadDevlogEntries(repoName);

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const lines = output.trim().split("\n");
	const commits: Commit[] = [];

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		const files = getCommitFiles(hash);
		if (!shouldIgnoreCommit(files, ignore)) {
			commits.push({ date, hash, message, files });
		}
	}

	const commitsByDate = new Map<string, Commit[]>();
	for (const commit of commits) {
		const existing = commitsByDate.get(commit.date) || [];
		existing.push(commit);
		commitsByDate.set(commit.date, existing);
	}

	let dateCount = 0;
	let isFirst = true;

	for (const [date, dateCommits] of commitsByDate) {
		if (dateCount >= days) {
			break;
		}
		dateCount++;

		if (!isFirst) {
			console.log();
		}
		isFirst = false;

		const entries = devlogEntries.get(date);
		if (entries && entries.length > 0) {
			const entryInfo = entries
				.map((e) => `${chalk.green(e.version)} ${e.title}`)
				.join(" | ");
			console.log(`${chalk.bold.blue(date)} ${entryInfo}`);
		} else {
			console.log(`${chalk.bold.blue(date)} ${chalk.red("⚠ devlog missing")}`);
		}

		for (const commit of dateCommits) {
			console.log(`  ${chalk.yellow(commit.hash)} ${commit.message}`);
			if (options.verbose) {
				const visibleFiles = commit.files.filter(
					(file) => !ignore.some((p) => file.startsWith(p)),
				);
				for (const file of visibleFiles) {
					console.log(`    ${chalk.dim(file)}`);
				}
			}
		}
	}
}
