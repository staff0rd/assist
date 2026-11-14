import type { HistoricalSession } from "../types";

export function transcriptTitle(entry: HistoricalSession | undefined): string {
	return entry?.title ?? entry?.name ?? "Transcript";
}
