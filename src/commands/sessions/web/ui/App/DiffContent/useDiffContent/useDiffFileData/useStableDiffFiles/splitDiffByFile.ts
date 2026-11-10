export function splitDiffByFile(diff: string): string[] {
	return diff
		.split(/^(?=diff --git )/m)
		.filter((chunk) => chunk.startsWith("diff --git "));
}
