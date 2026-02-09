import path from "node:path";
import chalk from "chalk";
import { findSourceFiles } from "../../complexity/findSourceFiles";
import { buildImportGraph } from "./buildImportGraph";
import { clusterDirectories } from "./clusterDirectories";
import { clusterFiles } from "./clusterFiles";
import { computeRewrites } from "./computeRewrites";
import { displayPlan } from "./displayPlan";
import { executePlan } from "./executePlan";
import { planDirectoryMoves, planFileMoves } from "./planFileMoves";
import type { RestructurePlan } from "./types";

type RestructureOptions = {
	apply?: boolean;
	maxDepth?: number;
};

function buildPlan(
	candidateFiles: string[],
	tsConfigPath: string,
): RestructurePlan {
	const candidates = new Set(candidateFiles.map((f) => path.resolve(f)));
	const graph = buildImportGraph(candidates, tsConfigPath);
	const allProjectFiles = new Set([
		...graph.importedBy.keys(),
		...graph.imports.keys(),
	]);

	const fileClusters = clusterFiles(graph);
	const dirClusters = clusterDirectories(graph);

	const fileResult = planFileMoves(fileClusters);
	const dirResult = planDirectoryMoves(dirClusters);

	const moves = [...fileResult.moves, ...dirResult.moves];
	const directories = [...fileResult.directories, ...dirResult.directories];
	const warnings = [...fileResult.warnings, ...dirResult.warnings];
	const rewrites = computeRewrites(moves, graph.edges, allProjectFiles);

	return { moves, rewrites, newDirectories: directories, warnings };
}

export async function restructure(
	pattern: string | undefined,
	options: RestructureOptions = {},
): Promise<void> {
	const targetPattern = pattern ?? "src";
	const files = findSourceFiles(targetPattern);

	if (files.length === 0) {
		console.log(chalk.yellow("No files found matching pattern"));
		return;
	}

	const tsConfigPath = path.resolve("tsconfig.json");
	const plan = buildPlan(files, tsConfigPath);

	if (plan.moves.length === 0) {
		console.log(chalk.green("No restructuring needed"));
		return;
	}

	displayPlan(plan);

	if (options.apply) {
		console.log(chalk.bold("\nApplying changes..."));
		executePlan(plan);
		console.log(chalk.green("\nRestructuring complete"));
	} else {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
	}
}
