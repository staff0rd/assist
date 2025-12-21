import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import semver from "semver";
import { DEVLOG_DIR, getRepoName } from "./shared";

function getLatestVersion(repoName: string): string | null {
	try {
		const files = readdirSync(DEVLOG_DIR)
			.filter((f) => f.endsWith(".md"))
			.sort()
			.reverse();

		for (const file of files) {
			const content = readFileSync(join(DEVLOG_DIR, file), "utf-8");
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

			if (frontmatterMatch) {
				const frontmatter = frontmatterMatch[1];
				const versionMatch = frontmatter.match(/version:\s*(.+)/);
				const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);

				if (versionMatch && tagsMatch) {
					const tags = tagsMatch[1].split(",").map((t) => t.trim());
					const firstTag = tags[0];

					if (firstTag === repoName) {
						return versionMatch[1].trim();
					}
				}
			}
		}
	} catch {
		// Directory doesn't exist or can't be read
	}

	return null;
}

function bumpPatchVersion(version: string): string {
	const cleaned = semver.clean(version) ?? semver.coerce(version)?.version;
	if (!cleaned) {
		return version;
	}
	const bumped = semver.inc(cleaned, "patch");
	return bumped ? `v${bumped}` : version;
}

export function version(): void {
	const name = getRepoName();
	const lastVersion = getLatestVersion(name);
	const nextVersion = lastVersion ? bumpPatchVersion(lastVersion) : null;

	console.log(`${chalk.bold("name:")} ${name}`);
	console.log(`${chalk.bold("last:")} ${lastVersion ?? chalk.dim("none")}`);
	console.log(`${chalk.bold("next:")} ${nextVersion ?? chalk.dim("none")}`);
}
