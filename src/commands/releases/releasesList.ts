import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import type { ReleaseNode, ReleaseStream } from "../../shared/types";

function describeNode(node: ReleaseNode): string {
	if (node.environment) return `${node.id} → ${node.environment}`;
	return `${node.id} (${node.kind ?? "step"})`;
}

function printStream(stream: ReleaseStream): void {
	console.log(`${chalk.bold(stream.name)} ${chalk.dim(stream.repo)}`);
	console.log(chalk.dim(`  workflow: ${stream.workflow}`));
	for (const node of stream.nodes) console.log(`  ${describeNode(node)}`);
	for (const [from, to] of stream.edges)
		console.log(chalk.dim(`  ${from} → ${to}`));
}

export function releasesList(): void {
	const streams = loadConfig().releases?.streams ?? [];
	if (streams.length === 0) {
		console.log(
			chalk.dim("No release streams configured under releases.streams."),
		);
		return;
	}
	for (const stream of streams) printStream(stream);
}
