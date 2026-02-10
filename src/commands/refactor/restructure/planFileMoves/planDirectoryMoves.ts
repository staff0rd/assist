import fs from "node:fs";
import path from "node:path";
import type { FileMove } from "../types";
import { checkDirConflict, emptyResult, type MoveResult } from "./index";

function collectEntry(results: string[], dir: string, entry: fs.Dirent): void {
	const full = path.join(dir, entry.name);
	const items = entry.isDirectory() ? listFilesRecursive(full) : [full];
	results.push(...items);
}

function listFilesRecursive(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const results: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		collectEntry(results, dir, entry);
	}
	return results;
}

function addDirectoryFileMoves(
	moves: FileMove[],
	childDir: string,
	newLocation: string,
	reason: string,
): void {
	for (const file of listFilesRecursive(childDir)) {
		const rel = path.relative(childDir, file);
		moves.push({ from: file, to: path.join(newLocation, rel), reason });
	}
}

function resolveChildDest(parentDir: string, childDir: string): string {
	return path.join(parentDir, path.basename(childDir));
}

function childMoveReason(parentDir: string): string {
	return `Directory only imported from ${path.basename(parentDir)}/`;
}

function registerDirectoryMove(
	result: MoveResult,
	childDir: string,
	dest: string,
	parentDir: string,
): void {
	result.directories.push(dest);
	const reason = childMoveReason(parentDir);
	addDirectoryFileMoves(result.moves, childDir, dest, reason);
}

function planChildDirectoryMove(
	result: MoveResult,
	parentDir: string,
	childDir: string,
): void {
	const dest = resolveChildDest(parentDir, childDir);
	if (checkDirConflict(result, childDir, dest)) return;
	registerDirectoryMove(result, childDir, dest, parentDir);
}

function processDirectoryCluster(
	result: MoveResult,
	parentDir: string,
	childDirs: string[],
): void {
	for (const childDir of childDirs)
		planChildDirectoryMove(result, parentDir, childDir);
}

export function planDirectoryMoves(
	clusters: Map<string, string[]>,
): MoveResult {
	const result = emptyResult();
	for (const [parentDir, childDirs] of clusters)
		processDirectoryCluster(result, parentDir, childDirs);
	return result;
}
