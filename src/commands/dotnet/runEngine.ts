import { filterToChangedFiles } from "./filterToChangedFiles";
import { type Issue, parseInspectReport } from "./parseInspectReport";
import { runInspectCode } from "./runInspectCode";
import { runRoslynInspect } from "./runRoslynInspect";

export function runEngine(
	resolved: string,
	changedFiles: string[],
	options: { swea?: boolean; roslyn?: boolean },
): Issue[] {
	if (options.roslyn) {
		return filterToChangedFiles(runRoslynInspect(resolved), changedFiles);
	}
	return parseInspectReport(
		runInspectCode(resolved, changedFiles.join(";"), !!options.swea),
	);
}
