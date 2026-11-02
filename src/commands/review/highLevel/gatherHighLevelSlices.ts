import { readFileSync } from "node:fs";
import { formatSlicingRequest } from "./formatSlicingRequest";
import { highLevelSlicesPath } from "./highLevelSlicesPath";
import { listHighLevelHunks } from "./listHighLevelHunks";
import { readJsonFile } from "./readJsonFile";
import { resolveHighLevelSlices } from "./resolveHighLevelSlices";
import type { HighLevelFile, HighLevelSlice } from "./types";
import { writeJsonFile } from "./writeJsonFile";

export type HighLevelSlicing = {
	slicesFile?: string;
	force: boolean;
};

type SlicedHead = {
	repo: string;
	headRef: string;
	headSha: string;
};

function readSlicesFile(file: string): unknown {
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch (error) {
		throw new Error(
			`could not read slices from ${file}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

function sliceFromFile(
	file: string,
	files: HighLevelFile[],
	path: string,
): HighLevelSlice[] {
	const { slices, warnings } = resolveHighLevelSlices(
		readSlicesFile(file),
		listHighLevelHunks(files),
	);
	for (const warning of warnings) console.warn(`Warning: ${warning}`);
	writeJsonFile(path, slices);
	return slices;
}

export function gatherHighLevelSlices(
	head: SlicedHead,
	files: HighLevelFile[],
	slicing: HighLevelSlicing,
): HighLevelSlice[] {
	const path = highLevelSlicesPath(head.repo, head.headRef, head.headSha);
	if (slicing.slicesFile) return sliceFromFile(slicing.slicesFile, files, path);
	const saved = slicing.force
		? undefined
		: readJsonFile<HighLevelSlice[]>(path);
	if (saved) return saved;
	console.log(formatSlicingRequest(listHighLevelHunks(files)));
	process.exit(2);
}
