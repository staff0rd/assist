import type { RunConfig } from "../../shared/types";
import { editRepoRunList } from "./editRepoRunList";
import { ensureNoDuplicateRun } from "./ensureNoDuplicateRun";

export function addRepoRunConfig(
	entry: RunConfig,
	repoName: string | undefined,
	cwd: string = process.cwd(),
): Promise<string> {
	return editRepoRunList(repoName, cwd, (runList) => {
		ensureNoDuplicateRun(runList, entry.name);
		return [...runList, entry];
	});
}
