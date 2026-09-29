import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { walkSourceFiles } from "../complexity/walkSourceFiles";
import { applyPlan } from "./restructure/applyPlan";
import { buildPlan } from "./restructure/buildPlan";
import { checkPlan } from "./restructure/checkPlan";
import { displayDeepChains } from "./restructure/displayDeepChains";
import { displayPlan } from "./restructure/displayPlan";
import { findDeepChains } from "./restructure/findDeepChains";
import { partitionIgnored } from "./restructure/partitionIgnored";

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

	const { pin = [], maxDepth = 10 } = loadConfig().restructure ?? {};
	const plan = buildPlan(scopeRoot, scoped, ignored, pin);
	const chains = findDeepChains(plan.targets.values(), scopeRoot, maxDepth);
	if (options.check) return checkPlan(plan, chains, maxDepth);

	displayPlan(plan);
	displayDeepChains(chains, maxDepth);
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
