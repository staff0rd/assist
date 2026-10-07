import chalk from "chalk";
import type { HighLevelTestFile, HighLevelTestNode } from "./types";

function formatNode(node: HighLevelTestNode, depth: number): string[] {
	const indent = "  ".repeat(depth + 2);
	if (node.kind === "it") return [`${indent}${chalk.dim("·")} ${node.name}`];
	return [
		`${indent}${chalk.bold(node.name)}`,
		...node.children.flatMap((child) => formatNode(child, depth + 1)),
	];
}

export function formatHighLevelTests(
	files: HighLevelTestFile[],
	testPaths: string[],
): string {
	const heading = chalk.bold.underline("Changed tests");
	if (files.length === 0)
		return `${heading}\n  ${chalk.dim(`no changed test in files matching ${testPaths.join(", ")}`)}`;
	return [
		heading,
		...files.flatMap((file) => [
			"",
			`  ${chalk.bold(file.path)} ${chalk.dim(`(${file.status})`)}`,
			...file.tests.flatMap((node) => formatNode(node, 0)),
		]),
	].join("\n");
}
