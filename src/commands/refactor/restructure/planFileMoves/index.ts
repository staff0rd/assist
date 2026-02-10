import fs from "node:fs";
import path from "node:path";
import type { FileMove } from "../types";

export type MoveResult = {
	moves: FileMove[];
	directories: string[];
	warnings: string[];
};

export function emptyResult(): MoveResult {
	return { moves: [], directories: [], warnings: [] };
}

function childMoveData(
	child: string,
	newDir: string,
	parentBase: string,
): FileMove {
	const to = path.join(newDir, path.basename(child));
	return { from: child, to, reason: `Only imported by ${parentBase}` };
}

function addChildMoves(
	moves: FileMove[],
	children: string[],
	newDir: string,
	parentBase: string,
): void {
	for (const child of children)
		moves.push(childMoveData(child, newDir, parentBase));
}

export function checkDirConflict(
	result: MoveResult,
	label: string,
	dir: string,
): boolean {
	if (!fs.existsSync(dir)) return false;
	result.warnings.push(`Skipping ${label}: directory ${dir} already exists`);
	return true;
}

function getBaseName(filePath: string): string {
	return path.basename(filePath, path.extname(filePath));
}

function resolveClusterDir(parent: string): string {
	return path.join(path.dirname(parent), getBaseName(parent));
}

function createParentMove(parent: string, newDir: string): FileMove {
	return {
		from: parent,
		to: path.join(newDir, `index${path.extname(parent)}`),
		reason: `Main module of new ${getBaseName(parent)}/ directory`,
	};
}

function registerClusterMoves(
	result: MoveResult,
	parent: string,
	newDir: string,
	children: string[],
): void {
	result.directories.push(newDir);
	result.moves.push(createParentMove(parent, newDir));
	addChildMoves(result.moves, children, newDir, getBaseName(parent));
}

function planClusterMoves(
	result: MoveResult,
	parent: string,
	children: string[],
): void {
	const newDir = resolveClusterDir(parent);
	if (checkDirConflict(result, parent, newDir)) return;
	registerClusterMoves(result, parent, newDir, children);
}

export function planFileMoves(clusters: Map<string, string[]>): MoveResult {
	const result = emptyResult();
	for (const [parent, children] of clusters) {
		planClusterMoves(result, parent, children);
	}
	return result;
}

export { planDirectoryMoves } from "./planDirectoryMoves";
