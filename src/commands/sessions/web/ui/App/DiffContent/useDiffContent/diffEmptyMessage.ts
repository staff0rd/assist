export function diffEmptyMessage(error: boolean, fileCount: number): string {
	if (error) return "Failed to load diff.";
	if (fileCount === 0) return "No changes in this scope.";
	return "No files match your filter.";
}
