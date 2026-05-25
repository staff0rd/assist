import { readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { encodeCwdForProjects } from "./encodeCwdForProjects";
import { isSdkCliOnly } from "./isSdkCliOnly";

function getProjectDir(cwd: string): string {
	return join(homedir(), ".claude", "projects", encodeCwdForProjects(cwd));
}

type FindOptions = {
	excludeSessionId?: string;
	projectDir?: string;
};

/**
 * Locate the most-recent prior session JSONL under
 * `~/.claude/projects/<encoded-cwd>/`, excluding the current session id
 * and sdk-cli-only transcripts. Returns undefined if nothing eligible.
 */
export function findRecentSessionJsonl(
	cwd: string,
	options: FindOptions = {},
): string | undefined {
	const projectDir = options.projectDir ?? getProjectDir(cwd);
	let entries: string[];
	try {
		entries = readdirSync(projectDir);
	} catch {
		return undefined;
	}

	const jsonls = entries
		.filter((f) => f.endsWith(".jsonl"))
		.map((name) => {
			const path = join(projectDir, name);
			let mtime = 0;
			try {
				mtime = statSync(path).mtimeMs;
			} catch {
				return undefined;
			}
			return { path, name, mtime };
		})
		.filter((x): x is { path: string; name: string; mtime: number } => !!x)
		.sort((a, b) => b.mtime - a.mtime);

	for (const { path, name } of jsonls) {
		const sessionId = name.replace(/\.jsonl$/, "");
		if (options.excludeSessionId && sessionId === options.excludeSessionId)
			continue;
		if (isSdkCliOnly(path)) continue;
		return path;
	}
	return undefined;
}
