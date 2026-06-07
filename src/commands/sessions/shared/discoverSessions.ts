import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { type HistoricalSession, parseSessionFile } from "./parseSessionFile";

/**
 * Discover all session JSONL file paths under ~/.claude/projects/.
 * Returns absolute paths (unordered).
 */
export async function discoverSessionJsonlPaths(): Promise<string[]> {
	const projectsDir = path.join(os.homedir(), ".claude", "projects");
	let projectDirs: string[];
	try {
		projectDirs = await fs.promises.readdir(projectsDir);
	} catch {
		return [];
	}

	const paths: string[] = [];

	await Promise.all(
		projectDirs.map(async (dirName) => {
			const dirPath = path.join(projectsDir, dirName);
			let entries: string[];
			try {
				entries = await fs.promises.readdir(dirPath);
			} catch {
				return;
			}

			const jsonlFiles = entries.filter((e) => e.endsWith(".jsonl"));
			for (const file of jsonlFiles) {
				paths.push(path.join(dirPath, file));
			}
		}),
	);

	return paths;
}

/**
 * Scan ~/.claude/projects/ for session JSONL files and extract metadata.
 * Returns sessions newest-first.
 */
export async function discoverSessions(): Promise<HistoricalSession[]> {
	const paths = await discoverSessionJsonlPaths();
	const sessions: HistoricalSession[] = [];

	await Promise.all(
		paths.map(async (filePath) => {
			const session = await parseSessionFile(filePath);
			if (session) sessions.push(session);
		}),
	);

	sessions.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
	return sessions;
}
