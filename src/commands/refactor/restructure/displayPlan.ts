import path from "node:path";
import chalk from "chalk";
import { computeDepthStats } from "./computeDepthStats";
import { formatTree } from "./formatTree";
import type { RestructurePlan } from "./types";

function relPath(filePath: string): string {
	return path.relative(process.cwd(), filePath);
}

function displayMoves(plan: RestructurePlan): void {
	if (plan.moves.length === 0) return;
	console.log(chalk.bold("\nFile moves:"));
	for (const move of plan.moves) {
		console.log(
			`  ${chalk.red(relPath(move.from))} → ${chalk.green(relPath(move.to))}`,
		);
		console.log(chalk.dim(`    ${move.reason}`));
	}
}

function displayTree(plan: RestructurePlan): void {
	console.log(
		chalk.bold(`\nResulting tree (${relPath(plan.scopeRoot) || "."}/):`),
	);
	for (const line of formatTree(plan.targets.values(), plan.scopeRoot))
		console.log(`  ${line}`);
}

function displayDepthStats(plan: RestructurePlan): void {
	const { max, distribution } = computeDepthStats(
		plan.targets.values(),
		plan.scopeRoot,
	);
	console.log(chalk.bold(`\nDepth (max ${max}):`));
	for (const depth of [...distribution.keys()].sort((a, b) => a - b))
		console.log(`  ${depth}: ${distribution.get(depth)} file(s)`);
}

function displayErrors(errors: string[]): void {
	if (errors.length === 0) return;
	console.log(chalk.red("\nErrors:"));
	for (const error of errors) console.log(chalk.red(`  ${error}`));
}

export function displayPlan(plan: RestructurePlan): void {
	displayMoves(plan);
	displayTree(plan);
	displayDepthStats(plan);
	displayErrors(plan.errors);
	const rewrittenFiles = new Set(plan.rewrites.map((r) => r.file)).size;
	console.log(
		chalk.dim(
			`\nSummary: ${plan.moves.length} file(s) moved, ${plan.rewrites.length} imports rewritten across ${rewrittenFiles} file(s), ${plan.errors.length} error(s)`,
		),
	);
}
