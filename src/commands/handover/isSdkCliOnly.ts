import { iterateUserEntries } from "../sessions/summarise/iterateUserEntries";

/**
 * A transcript is sdk-cli-only when every `type:"user"` entry with text
 * content has `entrypoint:"sdk-cli"`. Transcripts with zero user entries
 * are also treated as sdk-cli-only (nothing useful to summarise).
 */
export function isSdkCliOnly(jsonlPath: string): boolean {
	for (const entry of iterateUserEntries(jsonlPath)) {
		if (entry.entrypoint !== "sdk-cli") return false;
	}
	return true;
}
