import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";

type DiffOptions = {
	days?: number;
};

type DevlogEntry = {
	version: string;
	title: string;
};

function loadDevlogEntries(): Map<string, DevlogEntry[]> {
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

				if (dateMatch && versionMatch && titleMatch) {
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

export function diff(options: DiffOptions): void {
	const days = options.days ?? 30;
	const devlogEntries = loadDevlogEntries();

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const lines = output.trim().split("\n");
	let currentDate = "";
	let dateCount = 0;

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		if (dateCount >= days && date !== currentDate) {
			break;
		}

		if (date !== currentDate) {
			if (currentDate !== "") {
				console.log();
			}
			currentDate = date;
			dateCount++;

			const entries = devlogEntries.get(date);
			if (entries && entries.length > 0) {
				const entryInfo = entries
					.map((e) => `${chalk.green(e.version)} ${e.title}`)
					.join(" | ");
				console.log(`${chalk.bold.blue(date)} ${entryInfo}`);
			} else {
				console.log(
					`${chalk.bold.blue(date)} ${chalk.red("⚠ devlog missing")}`,
				);
			}
		}

		console.log(`  ${chalk.yellow(hash)} ${message}`);
	}
}
