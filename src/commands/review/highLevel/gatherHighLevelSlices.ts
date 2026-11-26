import { formatSlicingRequest } from "./formatSlicingRequest";
import { highLevelSlicesPath } from "./highLevelSlicesPath";
import { listHighLevelHunks } from "./listHighLevelHunks";
import { noSavedSlicesMessage } from "../../../shared/noSavedSlicesMessage";
import { readJsonFile } from "./readJsonFile";
import type {
	HighLevelFile,
	HighLevelSlice,
	HighLevelSliceSet,
	HighLevelTestFile,
} from "./types";
import { sliceFromFile } from "./sliceFromFile";

export type HighLevelSlicing = {
	slicesFile?: string;
	force: boolean;
	reuseOnly?: boolean;
};

type SlicedHead = {
	prNumber: number;
	repo: string;
	headRef: string;
	headSha: string;
};

function readSavedSlices(path: string): HighLevelSliceSet | undefined {
	const saved = readJsonFile<HighLevelSlice[] | HighLevelSliceSet>(path);
	return Array.isArray(saved) ? { slices: saved } : saved;
}

export function gatherHighLevelSlices(
	head: SlicedHead,
	files: HighLevelFile[],
	slicing: HighLevelSlicing,
	tests: HighLevelTestFile[] = [],
): HighLevelSliceSet {
	const path = highLevelSlicesPath(head.repo, head.headRef, head.headSha);
	if (slicing.slicesFile)
		return sliceFromFile(slicing.slicesFile, files, tests, path);
	const saved = slicing.force ? undefined : readSavedSlices(path);
	if (saved) return saved;
	if (slicing.reuseOnly) {
		console.error(noSavedSlicesMessage(head.prNumber, head.headSha));
		process.exit(1);
	}
	console.log(formatSlicingRequest(listHighLevelHunks(files), tests));
	process.exit(2);
}
