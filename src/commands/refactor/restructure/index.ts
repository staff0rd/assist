import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { walkSourceFiles } from "../../complexity/walkSourceFiles";
import { applyPlan } from "./applyPlan";
import { buildPlan } from "./buildPlan";
import { checkPlan } from "./checkPlan";
import { displayPlan } from "./displayPlan";
import { partitionIgnored } from "./partitionIgnored";

type RestructureOptions = {
	apply?: boolean;
	check?: boolean;
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

	const found: string[] = [];
	walkSourceFiles(scopeRoot, found);
	const { scoped, ignored } = partitionIgnored(found);
	if (scoped.length === 0) {
		console.log(chalk.yellow("No files found under root"));
		return;
	}

	const plan = buildPlan(scopeRoot, scoped, ignored);
	if (options.check) return checkPlan(plan);

	displayPlan(plan);
	if (plan.moves.length === 0 && plan.errors.length === 0) {
		console.log(chalk.green("No restructuring needed"));
		return;
	}
	if (!options.apply) {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
		return;
	}
	applyPlan(plan);
}
