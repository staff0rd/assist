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

const MODULE_REFERENCE =
	/(\bfrom\s+|\bimport\s+|\bimport\s*\(\s*|\bvi\.\w+(?:<[^>]*>)?\(\s*)(["'])([^"'\n]+)\2/g;

function applyFileRewrites(
	file: string,
	fileRewrites: ImportRewrite[],
): string {
	const replacements = new Map(
		fileRewrites.map((r) => [r.oldSpecifier, r.newSpecifier]),
	);
	return fs
		.readFileSync(file, "utf8")
		.replace(
			MODULE_REFERENCE,
			(match, prefix: string, quote: string, specifier: string) => {
				const replacement = replacements.get(specifier);
				return replacement === undefined
					? match
					: `${prefix}${quote}${replacement}${quote}`;
			},
		);
}

export function applyRewrites(rewrites: ImportRewrite[]): Map<string, string> {
	const updatedContents = new Map<string, string>();
	for (const [file, fileRewrites] of groupByFile(rewrites)) {
		updatedContents.set(file, applyFileRewrites(file, fileRewrites));
	}
	return updatedContents;
}
