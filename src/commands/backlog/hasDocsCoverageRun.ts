import { isRunLink } from "../../shared/isRunLink";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { getBacklogDir } from "./getBacklogDir";

export function hasDocsCoverageRun(): boolean {
	try {
		return (loadConfigFrom(getBacklogDir()).run ?? []).some(
			(entry) => !isRunLink(entry) && entry.name === "docs:coverage",
		);
	} catch {
		return false;
	}
}
