import type { RunEntry, RunLink } from "./types";

export function isRunLink(entry: RunEntry): entry is RunLink {
	return "link" in entry;
}
