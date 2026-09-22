import chalk from "chalk";
import type { ReleaseStream } from "../../shared/types";

function printDerived(stream: ReleaseStream): void {
	const environments = stream.nodes.flatMap((n) => n.environment ?? []);
	const steps = stream.nodes.filter((n) => !n.environment);
	console.log(
		`${chalk.bold(stream.name)} ${chalk.dim(`${stream.repo} · ${stream.workflow}`)}`,
	);
	console.log(
		`  environments: ${environments.join(", ") || chalk.dim("none")}`,
	);
	if (steps.length > 0)
		console.log(
			`  steps: ${steps.map((n) => `${n.id} [${n.kind ?? "step"}]`).join(", ")}`,
		);
	const edges = stream.edges.map(([from, to]) => `${from} → ${to}`);
	console.log(`  edges: ${edges.join(", ") || chalk.dim("none")}`);
}

export function reportDerivedStreams(
	streams: ReleaseStream[],
	target: string,
): void {
	for (const stream of streams) printDerived(stream);
	console.log(chalk.dim(`Written to ${target}`));
}
