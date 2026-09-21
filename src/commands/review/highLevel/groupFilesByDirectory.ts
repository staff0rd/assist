import type { HighLevelFile } from "./types";

export type DirectoryGroup = {
	dirs: Map<string, DirectoryGroup>;
	files: HighLevelFile[];
};

const emptyDirectoryGroup = (): DirectoryGroup => ({
	dirs: new Map(),
	files: [],
});

function place(root: DirectoryGroup, file: HighLevelFile): void {
	const segments = file.path.split("/").filter(Boolean);
	segments.pop();
	let at = root;
	for (const segment of segments) {
		const next = at.dirs.get(segment) ?? emptyDirectoryGroup();
		at.dirs.set(segment, next);
		at = next;
	}
	at.files.push(file);
}

export function groupFilesByDirectory(files: HighLevelFile[]): DirectoryGroup {
	const root = emptyDirectoryGroup();
	for (const file of files) place(root, file);
	return root;
}
