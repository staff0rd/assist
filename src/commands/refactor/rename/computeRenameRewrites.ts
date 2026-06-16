import { findTsConfig } from "../extract/findTsConfig";
import { buildImportGraph } from "../restructure/buildImportGraph";
import { computeRewrites } from "../restructure/computeRewrites";
import type { FileMove, ImportRewrite } from "../restructure/types";

export function computeRenameRewrites(
	sourcePath: string,
	destPath: string,
): ImportRewrite[] {
	const tsConfigPath = findTsConfig(sourcePath);
	const graph = buildImportGraph(new Set([sourcePath]), tsConfigPath);
	const allProjectFiles = new Set([
		...graph.importedBy.keys(),
		...graph.imports.keys(),
		sourcePath,
	]);
	const move: FileMove = { from: sourcePath, to: destPath, reason: "rename" };
	return computeRewrites([move], graph.edges, allProjectFiles);
}
