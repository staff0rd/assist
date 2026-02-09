import path from "node:path";
import chalk from "chalk";
import type { RestructurePlan } from "./types";

export function displayPlan(plan: RestructurePlan): void {
	if (plan.warnings.length > 0) {
		console.log(chalk.yellow("\nWarnings:"));
		for (const warning of plan.warnings) {
			console.log(chalk.yellow(`  ${warning}`));
		}
	}

	if (plan.newDirectories.length > 0) {
		console.log(chalk.bold("\nNew directories:"));
		for (const dir of plan.newDirectories) {
			console.log(chalk.green(`  ${dir}/`));
		}
	}

	if (plan.moves.length > 0) {
		console.log(chalk.bold("\nFile moves:"));
		for (const move of plan.moves) {
			const fromRel = path.relative(process.cwd(), move.from);
			const toRel = path.relative(process.cwd(), move.to);
			console.log(`  ${chalk.red(fromRel)} → ${chalk.green(toRel)}`);
			console.log(chalk.dim(`    ${move.reason}`));
		}
	}

	if (plan.rewrites.length > 0) {
		const affectedFiles = new Set(plan.rewrites.map((r) => r.file));
		console.log(chalk.bold(`\nImport rewrites (${affectedFiles.size} files):`));
		for (const file of affectedFiles) {
			const fileRewrites = plan.rewrites.filter((r) => r.file === file);
			const rel = path.relative(process.cwd(), file);
			console.log(`  ${chalk.cyan(rel)}:`);
			for (const { oldSpecifier, newSpecifier } of fileRewrites) {
				console.log(
					`    ${chalk.red(`"${oldSpecifier}"`)} → ${chalk.green(`"${newSpecifier}"`)}`,
				);
			}
		}
	}

	console.log(
		chalk.dim(
			`\nSummary: ${plan.moves.length} file(s) moved, ${plan.rewrites.length} imports rewritten`,
		),
	);
}
