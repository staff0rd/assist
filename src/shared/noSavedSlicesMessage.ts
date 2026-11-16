export const noSavedSlicesPrefix = "No saved slices for #";

export function noSavedSlicesMessage(
	prNumber: number,
	headSha: string,
): string {
	return `${noSavedSlicesPrefix}${prNumber} at ${headSha.slice(0, 7)}`;
}
