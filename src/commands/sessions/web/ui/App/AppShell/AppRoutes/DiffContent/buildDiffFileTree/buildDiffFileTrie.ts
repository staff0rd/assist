import type { FileData } from "react-diff-view";
import { countDiffFileLines } from "./buildDiffFileTrie/countDiffFileLines";
import { filePath } from "../FileDiff";

export type DiffFileTrie = {
	dirs: Map<string, DiffFileTrie>;
	files: {
		name: string;
		fileKey: string;
		isNew: boolean;
		added: number;
		removed: number;
	}[];
};

const emptyTrie = (): DiffFileTrie => ({ dirs: new Map(), files: [] });

function insert(root: DiffFileTrie, file: FileData): void {
	const fileKey = filePath(file);
	const segments = fileKey.split("/").filter(Boolean);
	const basename = segments.pop();
	if (!basename) return;

	let dir = root;
	for (const segment of segments) {
		let next = dir.dirs.get(segment);
		if (!next) {
			next = emptyTrie();
			dir.dirs.set(segment, next);
		}
		dir = next;
	}
	dir.files.push({
		name: basename,
		fileKey,
		isNew: file.type === "add",
		...countDiffFileLines(file),
	});
}

export function buildDiffFileTrie(files: FileData[]): DiffFileTrie {
	const root = emptyTrie();
	for (const file of files) insert(root, file);
	return root;
}
