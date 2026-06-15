import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadConfig } from "../../../shared/loadConfig";
import {
	type HistoricalSession,
	parseSessionFile,
	type SessionOrigin,
} from "./parseSessionFile";

type DiscoveredSessionPath = { path: string; origin: SessionOrigin };

function sessionRoots(): Array<{ dir: string; origin: SessionOrigin }> {
	const roots: Array<{ dir: string; origin: SessionOrigin }> = [
		{ dir: path.join(os.homedir(), ".claude", "projects"), origin: "wsl" },
	];
	const windowsRoot = loadConfig().sessions?.windowsProjectsRoot;
	if (windowsRoot) roots.push({ dir: windowsRoot, origin: "windows" });
	return roots;
}

export async function discoverSessionJsonlPaths(): Promise<
	DiscoveredSessionPath[]
> {
	const results: DiscoveredSessionPath[] = [];

	await Promise.all(
		sessionRoots().map(async ({ dir, origin }) => {
			let projectDirs: string[];
			try {
				projectDirs = await fs.promises.readdir(dir);
			} catch {
				return;
			}

			await Promise.all(
				projectDirs.map(async (dirName) => {
					const dirPath = path.join(dir, dirName);
					let entries: string[];
					try {
						entries = await fs.promises.readdir(dirPath);
					} catch {
						return;
					}

					for (const file of entries) {
						if (file.endsWith(".jsonl"))
							results.push({ path: path.join(dirPath, file), origin });
					}
				}),
			);
		}),
	);

	return results;
}

export async function discoverSessionFiles(): Promise<string[]> {
	return (await discoverSessionJsonlPaths()).map((p) => p.path);
}

export async function discoverSessions(): Promise<HistoricalSession[]> {
	const paths = await discoverSessionJsonlPaths();
	const sessions: HistoricalSession[] = [];

	await Promise.all(
		paths.map(async ({ path: filePath, origin }) => {
			const session = await parseSessionFile(filePath, origin);
			if (session) sessions.push(session);
		}),
	);

	sessions.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
	return sessions;
}
