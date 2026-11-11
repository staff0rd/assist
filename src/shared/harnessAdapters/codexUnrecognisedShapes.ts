import { codexEntryShape } from "./codexEntryShape";

type Entry = Record<string, unknown>;

export function codexUnrecognisedShapes(entries: Entry[]): string[] {
	return [
		...new Set(
			entries
				.map(codexEntryShape)
				.filter((shape): shape is string => shape !== undefined),
		),
	];
}
