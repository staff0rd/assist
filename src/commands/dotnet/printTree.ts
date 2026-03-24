import chalk from "chalk";
import type { ProjectNode } from "./buildTree";

function printNodes(nodes: ProjectNode[], prefix: string): void {
	for (let i = 0; i < nodes.length; i++) {
		const isLast = i === nodes.length - 1;
		const connector = isLast ? "└── " : "├── ";
		const childPrefix = isLast ? "    " : "│   ";
		const isMissing = nodes[i].relativePath.startsWith("[MISSING]");
		const label = isMissing
			? chalk.red(nodes[i].relativePath)
			: nodes[i].relativePath;
		console.log(`${prefix}${connector}${label}`);
		printNodes(nodes[i].children, prefix + childPrefix);
	}
}

export function printTree(
	tree: ProjectNode,
	totalCount: number,
	solutions: string[],
): void {
	console.log(chalk.bold("\nProject Dependency Tree"));
	console.log(chalk.cyan(tree.relativePath));
	printNodes(tree.children, "");
	console.log(chalk.dim(`\n${totalCount} projects total (including root)`));

	console.log(chalk.bold("\nSolution Membership"));
	if (solutions.length === 0) {
		console.log(chalk.yellow("  Not found in any .sln"));
	} else {
		for (const sln of solutions) {
			console.log(`  ${chalk.green(sln)}`);
		}
	}
	console.log();
}

type JsonNode = {
	project: string;
	dependencies: JsonNode[];
};

function nodesToJson(node: ProjectNode): JsonNode[] {
	return node.children.map((child) => ({
		project: child.relativePath,
		dependencies: nodesToJson(child),
	}));
}

export function printJson(
	tree: ProjectNode,
	totalCount: number,
	solutions: string[],
): void {
	console.log(
		JSON.stringify(
			{
				project: tree.relativePath,
				totalProjects: totalCount,
				dependencies: nodesToJson(tree),
				solutions,
			},
			null,
			2,
		),
	);
}
