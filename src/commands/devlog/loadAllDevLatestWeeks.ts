import { readdirSync } from "node:fs";
import { loadDevWeeks } from "./loadDevWeeks";

function readRepoDirs(devDir: string): string[] {
	try {
		return readdirSync(devDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
	} catch {
		return [];
	}
}

export function loadAllDevLatestWeeks(devDir: string): Map<string, string> {
	const latest = new Map<string, string>();
	for (const repo of readRepoDirs(devDir)) {
		const week = loadDevWeeks(repo, devDir).at(-1);
		if (week) latest.set(repo, week);
	}
	return latest;
}
