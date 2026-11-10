import type { FileData } from "react-diff-view";

export function filePath(file: FileData): string {
	return file.newPath && file.newPath !== "/dev/null"
		? file.newPath
		: file.oldPath;
}
