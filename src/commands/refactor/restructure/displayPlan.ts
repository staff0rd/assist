import path from "node:path";
import chalk from "chalk";
import type { ImportRewrite, RestructurePlan } from "./types";

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

function displayRewrites(rewrites: ImportRewrite[]): void {
	if (rewrites.length === 0) return;
	const affectedFiles = new Set(rewrites.map((r) => r.file));
	console.log(chalk.bold(`\nImport rewrites (${affectedFiles.size} files):`));
	for (const file of affectedFiles) {
		console.log(`  ${chalk.cyan(relPath(file))}:`);
		for (const { oldSpecifier, newSpecifier } of rewrites.filter(
			(r) => r.file === file,
		)) {
			console.log(
				`    ${chalk.red(`"${oldSpecifier}"`)} → ${chalk.green(`"${newSpecifier}"`)}`,
			);
		}
	}
}

export function displayPlan(plan: RestructurePlan): void {
	if (plan.warnings.length > 0) {
		console.log(chalk.yellow("\nWarnings:"));
		for (const w of plan.warnings) console.log(chalk.yellow(`  ${w}`));
	}

	if (plan.newDirectories.length > 0) {
		console.log(chalk.bold("\nNew directories:"));
		for (const dir of plan.newDirectories)
			console.log(chalk.green(`  ${dir}/`));
	}

	displayMoves(plan);
	displayRewrites(plan.rewrites);

	console.log(
		chalk.dim(
			`\nSummary: ${plan.moves.length} file(s) moved, ${plan.rewrites.length} imports rewritten`,
		),
	);
}
