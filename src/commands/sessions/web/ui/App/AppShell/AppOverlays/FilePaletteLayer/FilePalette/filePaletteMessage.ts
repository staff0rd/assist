export function filePaletteMessage(
	cwd: string,
	query: string,
	state: { files: string[]; loading: boolean; error: boolean },
): string | undefined {
	if (!cwd) return "Select a repo to search files.";
	if (state.error) return "Couldn't search files in this repo.";
	if (state.files.length > 0 || state.loading) return undefined;
	return query ? "No matching files." : "No files in this repo.";
}
