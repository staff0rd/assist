import chalk from "chalk";
import type { ReleaseStream } from "../../shared/types";
import { readRepoStreams } from "./readRepoStreams";

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
	repo: string,
	before: ReleaseStream[],
): void {
	const after = readRepoStreams(repo);
	if ("error" in after) {
		console.error(
			chalk.red(`releases.streams does not validate:\n${after.error}`),
		);
		process.exitCode = 1;
		return;
	}
	if (after.streams.length === 0) {
		console.log(chalk.yellow(`No stream is declared for ${repo}.`));
		return;
	}
	if (JSON.stringify(after.streams) === JSON.stringify(before))
		console.log(chalk.dim(`releases.streams for ${repo} is unchanged.`));
	for (const stream of after.streams) printDerived(stream);
}
