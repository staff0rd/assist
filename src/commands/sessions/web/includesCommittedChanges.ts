import { loadConfigFrom } from "../../../shared/loadConfigFrom";

export function includesCommittedChanges(cwd: string): boolean {
	try {
		return loadConfigFrom(cwd).sessions?.includeCommittedChanges ?? true;
	} catch {
		return true;
	}
}
