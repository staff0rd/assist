import chalk from "chalk";
import { applyMoves } from "./applyMoves";
import { createLintProject } from "./createLintProject";

type Move = { sourcePath: string; destPath: string };

export function fixFileNameViolations(moves: Move[]): void {
	const start = performance.now();
	const project = createLintProject();
	const cwd = process.cwd();

	applyMoves(project, moves, cwd, (line) => console.log(chalk.green(line)));

	const ms = (performance.now() - start).toFixed(0);
	console.log(chalk.dim(`  Done in ${ms}ms`));
}
