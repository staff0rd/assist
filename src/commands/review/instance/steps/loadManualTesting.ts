import { exitWithError } from "../exitWithError";
import { highLevelSlicesPath } from "../../highLevel/highLevelSlicesPath";
import { readJsonFile } from "../../highLevel/readJsonFile";
import type {
	HighLevelManualTesting,
	HighLevelSlice,
	HighLevelSliceSet,
} from "../../highLevel/types";

type SavedHead = {
	number: number;
	fullName: string;
	headRef: string;
	sha: string;
};

export function loadManualTesting(head: SavedHead): HighLevelManualTesting {
	const saved = readJsonFile<HighLevelSlice[] | HighLevelSliceSet>(
		highLevelSlicesPath(head.fullName, head.headRef, head.sha),
	);
	const manualTesting = Array.isArray(saved) ? undefined : saved?.manualTesting;
	if (!manualTesting?.steps.length)
		exitWithError(
			`No manual testing steps are saved for #${head.number} at ${head.sha.slice(0, 7)}; run \`assist review high-level ${head.number}\` first to save them.`,
		);
	return manualTesting;
}
