import fs from "node:fs";
import path from "node:path";
import type { FileMove, ImportEdge, ImportRewrite } from "./types";

export function computeRewrites(
	moves: FileMove[],
	edges: ImportEdge[],
	allProjectFiles: Set<string>,
): ImportRewrite[] {
	const moveMap = new Map<string, string>();
	for (const move of moves) {
		moveMap.set(move.from, move.to);
	}

	const rewrites: ImportRewrite[] = [];

	for (const file of allProjectFiles) {
		const newFile = moveMap.get(file) ?? file;
		const edgesFromFile = edges.filter((e) => e.source === file);

		for (const edge of edgesFromFile) {
			const newTarget = moveMap.get(edge.target);
			if (!newTarget && !moveMap.has(file)) continue;

			const targetPath = newTarget ?? edge.target;
			const newSpecifier = computeSpecifier(newFile, targetPath);
			if (newSpecifier === edge.specifier) continue;

			rewrites.push({
				file,
				oldSpecifier: edge.specifier,
				newSpecifier,
			});
		}
	}

	return rewrites;
}

function computeSpecifier(fromFile: string, toFile: string): string {
	const fromDir = path.dirname(fromFile);
	let rel = path.relative(fromDir, toFile);

	rel = rel.replace(/\\/g, "/");

	rel = rel.replace(/\.tsx?$/, "");

	if (rel.endsWith("/index")) {
		rel = rel.slice(0, -"/index".length);
	}

	if (!rel.startsWith(".")) {
		rel = `./${rel}`;
	}

	return rel;
}

export function applyRewrites(rewrites: ImportRewrite[]): Map<string, string> {
	const fileRewrites = new Map<string, ImportRewrite[]>();
	for (const rewrite of rewrites) {
		const existing = fileRewrites.get(rewrite.file) ?? [];
		if (!fileRewrites.has(rewrite.file))
			fileRewrites.set(rewrite.file, existing);
		existing.push(rewrite);
	}

	const updatedContents = new Map<string, string>();

	for (const [file, fileSpecificRewrites] of fileRewrites) {
		let content = fs.readFileSync(file, "utf-8");
		for (const { oldSpecifier, newSpecifier } of fileSpecificRewrites) {
			const escaped = oldSpecifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const pattern = new RegExp(`(from\\s+["'])${escaped}(["'])`, "g");
			content = content.replace(pattern, `$1${newSpecifier}$2`);
		}
		updatedContents.set(file, content);
	}

	return updatedContents;
}
