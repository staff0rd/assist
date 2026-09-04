import type { VttSource } from "./types";

function removedNote(removed: string[]): string[] {
	if (removed.length === 0) return [];
	const distinct = [...new Set(removed)];
	const noun = removed.length === 1 ? "passage" : "passages";
	return [`${removed.length} ${noun} removed: ${distinct.join(", ")}`];
}

export function headerNotes(sources: VttSource[], removed: string[]): string[] {
	return [
		`Collapsed ${new Date().toISOString().slice(0, 10)} from:`,
		...sources.map((source) => `  ${source.name}`),
		...removedNote(removed),
	];
}
