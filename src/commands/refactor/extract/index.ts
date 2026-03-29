import path from "node:path";
import chalk from "chalk";
import { applyExtraction } from "./applyExtraction";
import { buildPlan } from "./buildPlan";
import { displayPlan } from "./displayPlan";
import { loadProjectFile } from "./loadProjectFile";

type ExtractOptions = {
	apply?: boolean;
};

export async function extract(
	file: string,
	functionName: string,
	destination: string,
	options: ExtractOptions = {},
): Promise<void> {
	const sourcePath = path.resolve(file);
	const destPath = path.resolve(destination);
	const cwd = process.cwd();
	const relDest = path.relative(cwd, destPath);

	const { project, sourceFile } = loadProjectFile(file);

	const plan = buildPlan(
		functionName,
		sourceFile,
		sourcePath,
		destPath,
		project,
	);

	displayPlan(functionName, relDest, plan, cwd);

	if (options.apply) {
		await applyExtraction(functionName, sourceFile, destPath, plan, project);
		console.log(chalk.green("\nExtraction complete"));
	} else {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
	}
}
