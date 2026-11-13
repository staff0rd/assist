import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type CloneBaseRepo = { name: string; cwd: string };

function hasGitDirectory(dir: string): boolean {
	const gitPath = join(dir, ".git");
	return existsSync(gitPath) && statSync(gitPath).isDirectory();
}

export function listCloneBaseRepos(baseDir: string): CloneBaseRepo[] {
	if (!existsSync(baseDir)) return [];
	return readdirSync(baseDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({ name: entry.name, cwd: join(baseDir, entry.name) }))
		.filter((repo) => hasGitDirectory(repo.cwd))
		.sort((a, b) => a.name.localeCompare(b.name));
}
