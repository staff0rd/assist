import chalk from "chalk";
import type { NodeRuntimeReport } from "../daemon/runtime/NodeRuntimeReport";

export function printNodeRuntime(
	name: string,
	runtime: NodeRuntimeReport | undefined,
): void {
	if (!runtime) {
		console.log(
			chalk.dim(
				`  runtime   not reported — restart ${name}'s daemon to record it`,
			),
		);
		return;
	}
	const mark = runtime.mismatch ? chalk.yellow("!") : chalk.green("✓");
	const declared = runtime.declared
		? ` (sessions.nodeVersion "${runtime.declared.spec}")`
		: "";
	console.log(
		`  ${mark} runtime   node ${runtime.node.version} ${chalk.dim(runtime.node.path)}${declared}`,
	);
	for (const probe of runtime.harnesses)
		console.log(
			`      ${probe.name.padEnd(7)} ${
				probe.error
					? chalk.dim(probe.error)
					: `${probe.version ?? "unknown version"} ${chalk.dim(probe.path ?? "")}`
			}`,
		);
	if (!runtime.mismatch) return;
	const remediation = runtime.declared?.error
		? `fix it on ${name} with \`assist config set sessions.nodeVersion <version> --node\``
		: `restart ${name}'s web server and daemon to pick it up`;
	console.log(`    ${chalk.yellow(`${runtime.mismatch} — ${remediation}`)}`);
}
