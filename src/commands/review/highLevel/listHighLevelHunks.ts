import { countHunkLines as countLines } from "./countHunkLines";
import { hunkTextsOf } from "./hunkTextsOf";
import type { HighLevelFile } from "./types";

export type HighLevelHunk = {
	ref: string;
	path: string;
	text: string;
	additions: number;
	deletions: number;
};

function hunksOfFile(file: HighLevelFile): HighLevelHunk[] {
	const texts = hunkTextsOf(file.patch);
	if (texts.length === 0)
		return [
			{
				ref: `${file.path}#0`,
				path: file.path,
				text: `(no patch shown: binary, too large or over the review budget; ${file.status}, +${file.additions} −${file.deletions})`,
				additions: file.additions,
				deletions: file.deletions,
			},
		];
	return texts.map((text, index) => ({
		ref: `${file.path}#${index}`,
		path: file.path,
		text,
		additions: countLines(text, "+"),
		deletions: countLines(text, "-"),
	}));
}

export function listHighLevelHunks(files: HighLevelFile[]): HighLevelHunk[] {
	return files.flatMap(hunksOfFile);
}
