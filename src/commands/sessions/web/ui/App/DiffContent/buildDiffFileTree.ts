import type { FileData } from "react-diff-view";
import {
	buildDiffFileTrie,
	type DiffFileTrie,
} from "./buildDiffFileTree/buildDiffFileTrie";

export type DiffFileTreeFile = {
	kind: "file";
	name: string;
	path: string;
	fileKey: string;
	isNew: boolean;
	added: number;
	removed: number;
};

type DiffFileTreeDir = {
	kind: "dir";
	name: string;
	path: string;
	children: DiffFileTreeNode[];
};

export type DiffFileTreeNode = DiffFileTreeDir | DiffFileTreeFile;

const join = (prefix: string, name: string): string =>
	prefix ? `${prefix}/${name}` : name;

const byName = <T extends DiffFileTreeNode>(nodes: T[]): T[] =>
	[...nodes].sort((a, b) => a.name.localeCompare(b.name));

function collapseDir(
	name: string,
	trie: DiffFileTrie,
	prefix: string,
): DiffFileTreeDir {
	let label = name;
	let path = join(prefix, name);
	let dir = trie;

	while (dir.files.length === 0 && dir.dirs.size === 1) {
		const [childName, child] = [...dir.dirs][0];
		label = `${label}/${childName}`;
		path = `${path}/${childName}`;
		dir = child;
	}

	return { kind: "dir", name: label, path, children: toNodes(dir, path) };
}

function toNodes(dir: DiffFileTrie, prefix: string): DiffFileTreeNode[] {
	const dirs = byName(
		[...dir.dirs].map(([name, child]) => collapseDir(name, child, prefix)),
	);
	const files = byName(
		dir.files.map(
			(file): DiffFileTreeFile => ({
				kind: "file",
				path: join(prefix, file.name),
				...file,
			}),
		),
	);

	return [...dirs, ...files];
}

export function buildDiffFileTree(files: FileData[]): DiffFileTreeNode[] {
	return toNodes(buildDiffFileTrie(files), "");
}
