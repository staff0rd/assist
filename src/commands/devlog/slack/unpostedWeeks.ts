import { devEntryPath } from "../devEntryPath";
import { loadDevWeeks } from "../loadDevWeeks";
import { readDevEntryFile } from "./readDevEntryFile";

export function unpostedWeeks(repoName: string, devDir: string): string[] {
	return loadDevWeeks(repoName, devDir).filter((week) => {
		const entry = readDevEntryFile(devEntryPath(repoName, week, devDir));
		return entry !== null && !entry.slack;
	});
}
