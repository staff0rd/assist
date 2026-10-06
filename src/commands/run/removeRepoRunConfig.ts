import type { RunEntry } from "../../shared/types";
import { editRepoRunList } from "./editRepoRunList";

function isNamed(entry: RunEntry, name: string): boolean {
	return "name" in entry && entry.name === name;
}

export function removeRepoRunConfig(
	name: string,
	repoName: string | undefined,
	cwd: string = process.cwd(),
): Promise<string> {
	return editRepoRunList(repoName, cwd, (runList, label) => {
		if (!runList.some((r) => isNamed(r, name))) {
			console.error(`Run configuration "${name}" not found in repo ${label}`);
			process.exit(1);
		}
		return runList.filter((r) => !isNamed(r, name));
	});
}
