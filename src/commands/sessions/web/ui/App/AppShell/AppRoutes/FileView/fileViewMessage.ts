import type { FileContentState } from "../fetchFileContent";

export function fileViewMessage(
	status: FileContentState["status"],
	path: string,
	cwd: string,
): string {
	if (!cwd) return "Select a repo to view files.";
	if (!path) return "No file path given.";
	if (status === "absent") return "This file is not in the working tree.";
	if (status === "too-large")
		return "This file is too large to display (over 2 MB).";
	return "Couldn't load this file.";
}
