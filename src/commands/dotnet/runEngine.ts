import { filterToChangedFiles } from "./filterToChangedFiles";
import { type Issue, parseInspectReport } from "./parseInspectReport";
import { runInspectCode } from "./runInspectCode";
import { runRoslynInspect } from "./runRoslynInspect";

export function runEngine(
	resolved: string,
	changedFiles: string[] | null,
	options: { swea?: boolean; roslyn?: boolean },
): Issue[] {
	if (options.roslyn) {
		const issues = runRoslynInspect(resolved);
		return changedFiles ? filterToChangedFiles(issues, changedFiles) : issues;
	}
	return parseInspectReport(
		runInspectCode(resolved, changedFiles?.join(";") ?? null, !!options.swea),
	);
}
