import chalk from "chalk";
import type {
	HighLevelStructure,
	HighLevelTreeDir,
	HighLevelTreeNode,
} from "./types";

const STATUS_MARKERS = {
	added: () => chalk.green("A"),
	removed: () => chalk.red("D"),
	modified: () => chalk.yellow("M"),
} as const;

function counts(additions: number, deletions: number): string {
	return `${chalk.green(`+${additions}`)} ${chalk.red(`-${deletions}`)}`;
}

function formatNode(node: HighLevelTreeNode, indent: string): string[] {
	if (node.kind === "file")
		return [
			`${indent}${STATUS_MARKERS[node.status]()} ${node.name} ${chalk.dim(counts(node.additions, node.deletions))}`,
		];
	const dir = node as HighLevelTreeDir;
	return [
		`${indent}${chalk.bold(`${dir.name}/`)} ${chalk.dim(counts(dir.additions, dir.deletions))}`,
		...dir.children.flatMap((child) => formatNode(child, `${indent}  `)),
	];
}

export function formatHighLevelStructure(
	structure: HighLevelStructure,
): string {
	const summary = `${structure.added} added · ${structure.removed} deleted · ${structure.modified} modified · ${counts(structure.additions, structure.deletions)}`;
	return [
		chalk.bold.underline("Structure"),
		`  ${summary}`,
		...structure.tree.flatMap((node) => formatNode(node, "  ")),
	].join("\n");
}
