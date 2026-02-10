import path from "node:path";
import type { FileMove, ImportEdge, ImportRewrite } from "../types";

function buildMoveMap(moves: FileMove[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const move of moves) map.set(move.from, move.to);
	return map;
}

function stripTrailingIndex(specifier: string): string {
	return specifier.endsWith("/index")
		? specifier.slice(0, -"/index".length)
		: specifier;
}

function ensureRelative(specifier: string): string {
	return specifier.startsWith(".") ? specifier : `./${specifier}`;
}

function normalizeSpecifier(rel: string): string {
	return ensureRelative(
		stripTrailingIndex(rel.replace(/\\/g, "/").replace(/\.tsx?$/, "")),
	);
}

function computeSpecifier(fromFile: string, toFile: string): string {
	return normalizeSpecifier(path.relative(path.dirname(fromFile), toFile));
}

function isAffected(edge: ImportEdge, moveMap: Map<string, string>): boolean {
	return moveMap.has(edge.target) || moveMap.has(edge.source);
}

function resolveTarget(edge: ImportEdge, moveMap: Map<string, string>): string {
	return moveMap.get(edge.target) ?? edge.target;
}

function createRewrite(edge: ImportEdge, newSpecifier: string): ImportRewrite {
	return { file: edge.source, oldSpecifier: edge.specifier, newSpecifier };
}

function rewriteIfChanged(
	edge: ImportEdge,
	newSpecifier: string,
): ImportRewrite | null {
	return newSpecifier === edge.specifier
		? null
		: createRewrite(edge, newSpecifier);
}

function rewriteEdge(
	edge: ImportEdge,
	newFile: string,
	moveMap: Map<string, string>,
): ImportRewrite | null {
	if (!isAffected(edge, moveMap)) return null;
	return rewriteIfChanged(
		edge,
		computeSpecifier(newFile, resolveTarget(edge, moveMap)),
	);
}

function fileEdges(edges: ImportEdge[], file: string): ImportEdge[] {
	return edges.filter((e) => e.source === file);
}

function collectRewrites(
	edges: ImportEdge[],
	newFile: string,
	moveMap: Map<string, string>,
): ImportRewrite[] {
	const rewrites: ImportRewrite[] = [];
	for (const edge of edges) {
		const rewrite = rewriteEdge(edge, newFile, moveMap);
		if (rewrite) rewrites.push(rewrite);
	}
	return rewrites;
}

function rewriteEdgesForFile(
	file: string,
	edges: ImportEdge[],
	moveMap: Map<string, string>,
): ImportRewrite[] {
	const newFile = moveMap.get(file) ?? file;
	return collectRewrites(fileEdges(edges, file), newFile, moveMap);
}

export function computeRewrites(
	moves: FileMove[],
	edges: ImportEdge[],
	allProjectFiles: Set<string>,
): ImportRewrite[] {
	const moveMap = buildMoveMap(moves);
	return [...allProjectFiles].flatMap((file) =>
		rewriteEdgesForFile(file, edges, moveMap),
	);
}

export { applyRewrites } from "./applyRewrites";
