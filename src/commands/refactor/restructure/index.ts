import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findSourceFiles } from "../../complexity/findSourceFiles";
import { displayPlan } from "./displayPlan";
import { executePlan } from "./executePlan";
import { buildPlan } from "./buildPlan";

type RestructureOptions = {
	apply?: boolean;
};

export async function restructure(
	root: string | undefined,
	options: RestructureOptions = {},
): Promise<void> {
	const scopeRoot = path.resolve(root ?? "src");
	if (!fs.existsSync(scopeRoot) || !fs.statSync(scopeRoot).isDirectory()) {
		console.log(chalk.red(`Not a directory: ${root ?? "src"}`));
		process.exit(1);
	}

	const files = findSourceFiles(root ?? "src").map((f) => path.resolve(f));
	if (files.length === 0) {
		console.log(chalk.yellow("No files found under root"));
		return;
	}

	const plan = buildPlan(scopeRoot, files);
	displayPlan(plan);

	if (plan.moves.length === 0) {
		console.log(chalk.green("No restructuring needed"));
		return;
	}
	if (!options.apply) {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
		return;
	}
	if (plan.errors.length > 0) {
		console.log(chalk.red("\nResolve the errors above before applying."));
		process.exit(1);
	}
	console.log(chalk.bold("\nApplying changes..."));
	executePlan(plan);
	console.log(chalk.green("\nRestructuring complete"));
}
