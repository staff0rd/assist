import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { PrComment } from "./types";

type CacheData = {
	prNumber: number;
	fetchedAt: string;
	comments: PrComment[];
};

function getCachePath(prNumber: number): string {
	return join(process.cwd(), ".assist", `pr-${prNumber}-comments.yaml`);
}

export function loadCommentsCache(prNumber: number): CacheData | null {
	const cachePath = getCachePath(prNumber);
	if (!existsSync(cachePath)) {
		return null;
	}
	const content = readFileSync(cachePath, "utf-8");
	return parse(content) as CacheData;
}

export function deleteCommentsCache(prNumber: number): void {
	const cachePath = getCachePath(prNumber);
	if (existsSync(cachePath)) {
		unlinkSync(cachePath);
		console.log("No more unresolved line comments. Cache dropped.");
	}
}
