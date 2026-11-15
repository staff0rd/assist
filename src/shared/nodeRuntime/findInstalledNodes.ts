import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { NodeSearchEnv } from "./NodeSpecResolution";
import { versionRoots } from "./versionRoots";

type InstalledNode = { version: string; path: string };

function listDirs(dir: string): string[] {
	try {
		return readdirSync(dir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
	} catch {
		return [];
	}
}

export function findInstalledNodes(search: NodeSearchEnv): InstalledNode[] {
	const seen = new Set<string>();
	const found: InstalledNode[] = [];
	for (const root of versionRoots(search)) {
		for (const name of listDirs(root.dir)) {
			const version = name.replace(/^v/, "");
			if (!/^\d+\.\d+\.\d+/.test(version)) continue;
			const path = root
				.nodeIn(join(root.dir, name))
				.find((candidate) => existsSync(candidate));
			if (!path || seen.has(path)) continue;
			seen.add(path);
			found.push({ version, path });
		}
	}
	return found;
}
