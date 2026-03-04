import { buildTree, collectAllDeps } from "./buildTree";
import { findContainingSolutions } from "./findContainingSolutions";
import { printJson, printTree } from "./printTree";
import { resolveCsproj } from "./resolveCsproj";

export async function deps(
	csprojPath: string,
	options: { json?: boolean },
): Promise<void> {
	const { resolved, repoRoot } = resolveCsproj(csprojPath);

	const tree = buildTree(resolved, repoRoot);
	const totalCount = collectAllDeps(tree).size + 1;
	const solutions = findContainingSolutions(resolved, repoRoot);

	if (options.json) {
		printJson(tree, totalCount, solutions);
	} else {
		printTree(tree, totalCount, solutions);
	}
}
