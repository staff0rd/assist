import { countHunkLines } from "./countHunkLines";
import { hunkTextsOf } from "./hunkTextsOf";
import type { HighLevelFile, HighLevelForeignHunk } from "./types";

export type HunkSlices = Map<string, number[]>;

function oldStartOf(text: string): number {
	return Number(/^@@ -(\d+)/.exec(text)?.[1] ?? 1);
}

function headerOf(text: string): string {
	return /^@@[^@]*@@/.exec(text)?.[0] ?? text.split("\n")[0] ?? "";
}

function sum(texts: string[], prefix: "+" | "-"): number {
	return texts.reduce((total, text) => total + countHunkLines(text, prefix), 0);
}

export function scopeFileToSlice(
	file: HighLevelFile,
	slice: number,
	hunkSlices: HunkSlices,
): HighLevelFile {
	const texts = hunkTextsOf(file.patch);
	const own: string[] = [];
	const elsewhere: HighLevelForeignHunk[] = [];
	texts.forEach((text, index) => {
		const slices = hunkSlices.get(`${file.path}#${index}`) ?? [];
		if (slices.includes(slice)) own.push(text);
		else
			elsewhere.push({
				oldStart: oldStartOf(text),
				header: headerOf(text),
				slice: slices[0] ?? 0,
			});
	});
	if (own.length === 0 || elsewhere.length === 0) return file;
	return {
		...file,
		patch: own.join("\n"),
		additions: sum(own, "+"),
		deletions: sum(own, "-"),
		split: { hunks: own.length, of: texts.length, elsewhere },
	};
}
