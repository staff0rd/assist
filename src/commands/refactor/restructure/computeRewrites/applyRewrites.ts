import fs from "node:fs";
import type { ImportRewrite } from "../types";

function getOrCreateList(
	map: Map<string, ImportRewrite[]>,
	key: string,
): ImportRewrite[] {
	const list = map.get(key) ?? [];
	if (!map.has(key)) map.set(key, list);
	return list;
}

function groupByFile(rewrites: ImportRewrite[]): Map<string, ImportRewrite[]> {
	const grouped = new Map<string, ImportRewrite[]>();
	for (const rewrite of rewrites) {
		getOrCreateList(grouped, rewrite.file).push(rewrite);
	}
	return grouped;
}

function rewriteSpecifier(
	content: string,
	oldSpecifier: string,
	newSpecifier: string,
): string {
	const escaped = oldSpecifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`(from\\s+["'])${escaped}(["'])`, "g");
	return content.replace(pattern, `$1${newSpecifier}$2`);
}

function applyFileRewrites(
	file: string,
	fileRewrites: ImportRewrite[],
): string {
	let content = fs.readFileSync(file, "utf-8");
	for (const { oldSpecifier, newSpecifier } of fileRewrites) {
		content = rewriteSpecifier(content, oldSpecifier, newSpecifier);
	}
	return content;
}

export function applyRewrites(rewrites: ImportRewrite[]): Map<string, string> {
	const updatedContents = new Map<string, string>();
	for (const [file, fileRewrites] of groupByFile(rewrites)) {
		updatedContents.set(file, applyFileRewrites(file, fileRewrites));
	}
	return updatedContents;
}
