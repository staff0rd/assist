import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { walkSourceFiles } from "../complexity/walkSourceFiles";
import { buildPlan } from "./restructure/buildPlan";
import { checkPlan } from "./restructure/checkPlan";
import { checkLayoutLimits } from "./restructure/checkLayoutLimits";
import { partitionIgnored } from "./restructure/partitionIgnored";
import { runPlan } from "./restructure/runPlan";

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
	const limits = checkLayoutLimits(plan, maxDepth);
	if (options.check) return checkPlan(plan, limits);
	runPlan(plan, limits, options.apply === true);
}
