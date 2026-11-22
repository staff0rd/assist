import { tryGit } from "../../shared/tryGit";

export function mergeInProgress(): boolean {
	return tryGit("rev-parse", "-q", "--verify", "MERGE_HEAD") !== null;
}
