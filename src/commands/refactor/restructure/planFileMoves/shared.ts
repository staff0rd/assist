import fs from "node:fs";
import type { FileMove } from "../types";

export type MoveResult = {
	moves: FileMove[];
	directories: string[];
	warnings: string[];
};

export function emptyResult(): MoveResult {
	return { moves: [], directories: [], warnings: [] };
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
