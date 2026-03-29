import path from "node:path";
import type { Project, SourceFile } from "ts-morph";
import type { TargetAnalysis } from "./analyseTarget";
import { analyseTarget } from "./analyseTarget";
import { buildDestinationContent } from "./buildDestinationContent";
import { findImporters, type ImporterUpdate } from "./findImporters";
import { getRelativeImportPath } from "./getRelativeImportPath";
import { sourceReferencesName } from "./sourceReferencesName";
export type ExtractionPlan = Omit<TargetAnalysis, "functionTexts"> & {
	destContent: string;
	destRelPath: string;
	sourceRelPath: string;
	barrelRelPath: string;
	sourceNeedsReimport: boolean;
	importersToUpdate: ImporterUpdate[];
	barrel: SourceFile | undefined;
};

function resolveBarrel(destPath: string, project: Project) {
	const indexPath = path.join(path.dirname(destPath), "index.ts");
	return {
		barrel: project.getSourceFile(indexPath),
		barrelRelPath: getRelativeImportPath(indexPath, destPath),
	};
}

export function buildPlan(
	functionName: string,
	sourceFile: SourceFile,
	sourcePath: string,
	destPath: string,
	project: Project,
): ExtractionPlan {
	const analysis = analyseTarget(sourceFile, functionName);
	const sourceRelPath = getRelativeImportPath(destPath, sourcePath);

	const { functionTexts: _, ...planFields } = analysis;

	return {
		...planFields,
		destContent: buildDestinationContent(
			analysis.functionTexts,
			analysis.imports,
			sourceRelPath,
			analysis.exportedDeps,
		),
		destRelPath: getRelativeImportPath(sourcePath, destPath),
		sourceRelPath,
		sourceNeedsReimport: sourceReferencesName(
			sourceFile,
			functionName,
			analysis.extractedNames,
		),
		importersToUpdate: analysis.target.isExported()
			? findImporters(functionName, sourceFile, destPath, project)
			: [],
		...resolveBarrel(destPath, project),
	};
}
