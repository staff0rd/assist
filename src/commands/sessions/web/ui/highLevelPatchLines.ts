type HighLevelPatchLine = {
	id: string;
	text: string;
};

export function highLevelPatchLines(patch: string): HighLevelPatchLine[] {
	return patch
		.split("\n")
		.map((text, index) => ({ id: `${index}:${text}`, text }));
}
