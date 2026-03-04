import { readFileSync } from "node:fs";
import path from "node:path";

const PROJECT_REF_RE = /<ProjectReference\s+Include="([^"]+)"/g;

function getProjectRefs(csprojPath: string): string[] {
	const content = readFileSync(csprojPath, "utf-8");
	const refs: string[] = [];
	for (const match of content.matchAll(PROJECT_REF_RE)) {
		refs.push(match[1].replace(/\\/g, "/"));
	}
	return refs;
}

export type ProjectNode = {
	path: string;
	relativePath: string;
	children: ProjectNode[];
};

export function buildTree(
	csprojPath: string,
	repoRoot: string,
	visited: Set<string> = new Set(),
): ProjectNode {
	const abs = path.resolve(csprojPath);
	const rel = path.relative(repoRoot, abs);
	const node: ProjectNode = { path: abs, relativePath: rel, children: [] };

	if (visited.has(abs)) return node;
	visited.add(abs);

	const dir = path.dirname(abs);
	for (const ref of getProjectRefs(abs)) {
		const childAbs = path.resolve(dir, ref);
		try {
			readFileSync(childAbs);
			node.children.push(buildTree(childAbs, repoRoot, visited));
		} catch {
			node.children.push({
				path: childAbs,
				relativePath: `[MISSING] ${ref}`,
				children: [],
			});
		}
	}

	return node;
}

export function collectAllDeps(node: ProjectNode): Set<string> {
	const result = new Set<string>();
	function walk(n: ProjectNode) {
		for (const child of n.children) {
			result.add(child.path);
			walk(child);
		}
	}
	walk(node);
	return result;
}
