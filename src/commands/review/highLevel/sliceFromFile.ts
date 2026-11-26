import { readFileSync } from "node:fs";
import { listHighLevelHunks } from "./listHighLevelHunks";
import { resolveHighLevelSlices } from "./resolveHighLevelSlices";
import type {
	HighLevelFile,
	HighLevelSliceSet,
	HighLevelTestFile,
} from "./types";
import { writeJsonFile } from "./writeJsonFile";

export function sliceFromFile(
	file: string,
	files: HighLevelFile[],
	tests: HighLevelTestFile[],
	path: string,
): HighLevelSliceSet {
	const { warnings, ...set } = resolveHighLevelSlices(
		readSlicesFile(file),
		listHighLevelHunks(files),
		tests,
	);
	for (const warning of warnings) console.warn(`Warning: ${warning}`);
	writeJsonFile(path, set);
	return set;
}

function readSlicesFile(file: string): unknown {
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch (error) {
		throw new Error(
			`could not read slices from ${file}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
