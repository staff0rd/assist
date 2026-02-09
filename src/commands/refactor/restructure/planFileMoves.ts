import fs from "node:fs";
import path from "node:path";
import type { FileMove } from "./types";

type MoveResult = {
	moves: FileMove[];
	directories: string[];
	warnings: string[];
};

function emptyResult(): MoveResult {
	return { moves: [], directories: [], warnings: [] };
}

export function planFileMoves(clusters: Map<string, string[]>): MoveResult {
	const result = emptyResult();

	for (const [parent, children] of clusters) {
		const parentBase = path.basename(parent, path.extname(parent));
		const newDirName = parentBase;
		const newDir = path.join(path.dirname(parent), newDirName);

		if (fs.existsSync(newDir)) {
			result.warnings.push(
				`Skipping ${parent}: directory ${newDir} already exists`,
			);
			continue;
		}

		result.directories.push(newDir);
		result.moves.push({
			from: parent,
			to: path.join(newDir, `index${path.extname(parent)}`),
			reason: `Main module of new ${newDirName}/ directory`,
		});

		for (const child of children) {
			result.moves.push({
				from: child,
				to: path.join(newDir, path.basename(child)),
				reason: `Only imported by ${parentBase}`,
			});
		}
	}

	return result;
}

export function planDirectoryMoves(
	clusters: Map<string, string[]>,
): MoveResult {
	const result = emptyResult();

	for (const [parentDir, childDirs] of clusters) {
		for (const childDir of childDirs) {
			const childName = path.basename(childDir);
			const newLocation = path.join(parentDir, childName);

			if (fs.existsSync(newLocation)) {
				result.warnings.push(
					`Skipping ${childDir}: ${newLocation} already exists`,
				);
				continue;
			}

			result.directories.push(newLocation);
			const files = listFilesRecursive(childDir);
			for (const file of files) {
				const rel = path.relative(childDir, file);
				result.moves.push({
					from: file,
					to: path.join(newLocation, rel),
					reason: `Directory only imported from ${path.basename(parentDir)}/`,
				});
			}
		}
	}

	return result;
}

function listFilesRecursive(dir: string): string[] {
	const results: string[] = [];
	if (!fs.existsSync(dir)) return results;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...listFilesRecursive(full));
		} else {
			results.push(full);
		}
	}
	return results;
}
