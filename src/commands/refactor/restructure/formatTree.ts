import path from "node:path";

type TreeNode = Map<string, TreeNode>;

function insert(root: TreeNode, parts: string[]): void {
	let node = root;
	for (const part of parts) {
		const child = node.get(part) ?? new Map();
		node.set(part, child);
		node = child;
	}
}

function render(node: TreeNode, indent: string, lines: string[]): void {
	const entries = [...node].sort(([a, ca], [b, cb]) => {
		const dirFirst = Number(cb.size > 0) - Number(ca.size > 0);
		return dirFirst || a.localeCompare(b);
	});
	for (const [name, child] of entries) {
		lines.push(`${indent}${name}${child.size > 0 ? "/" : ""}`);
		render(child, `${indent}  `, lines);
	}
}

export function formatTree(
	files: Iterable<string>,
	scopeRoot: string,
): string[] {
	const root: TreeNode = new Map();
	for (const file of files)
		insert(root, path.relative(scopeRoot, file).split(path.sep));
	const lines: string[] = [];
	render(root, "", lines);
	return lines;
}
