import type { HistoricalSession } from "./types";

// Mirrors sessionTitle(): prefer the prompt entered alongside the command
// marker, falling back to the first-message name when no marker is present.
export function historyTitle(session: HistoricalSession): string {
	return session.prompt || session.name;
}
