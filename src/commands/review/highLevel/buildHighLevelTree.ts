import type { DirectoryGroup } from "./groupFilesByDirectory";
import { groupFilesByDirectory } from "./groupFilesByDirectory";
import type {
	HighLevelFile,
	HighLevelTreeDir,
	HighLevelTreeNode,
} from "./types";

function basename(path: string): string {
	return path.slice(path.lastIndexOf("/") + 1);
}

function sum(nodes: HighLevelTreeNode[], key: "additions" | "deletions") {
	return nodes.reduce((total, node) => total + node[key], 0);
}

function byName(a: HighLevelTreeNode, b: HighLevelTreeNode): number {
	return a.name.localeCompare(b.name);
}

function nodesOf(at: DirectoryGroup, prefix: string): HighLevelTreeNode[] {
	const dirs = [...at.dirs].map(([name, child]) =>
		collapsedDirNode(name, child, prefix),
	);
	const files = at.files.map(
		(file): HighLevelTreeNode => ({
			kind: "file",
			name: basename(file.path),
			...file,
		}),
	);
	return [...dirs.sort(byName), ...files.sort(byName)];
}

function collapsedDirNode(
	name: string,
	at: DirectoryGroup,
	prefix: string,
): HighLevelTreeDir {
	let label = name;
	let path = prefix ? `${prefix}/${name}` : name;
	let node = at;
	while (node.files.length === 0 && node.dirs.size === 1) {
		const [childName, child] = [...node.dirs][0] as [string, DirectoryGroup];
		label = `${label}/${childName}`;
		path = `${path}/${childName}`;
		node = child;
	}
	const children = nodesOf(node, path);
	return {
		kind: "dir",
		name: label,
		path,
		additions: sum(children, "additions"),
		deletions: sum(children, "deletions"),
		children,
	};
}

export function buildHighLevelTree(
	files: HighLevelFile[],
): HighLevelTreeNode[] {
	return nodesOf(groupFilesByDirectory(files), "");
}
