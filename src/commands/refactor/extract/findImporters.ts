import type { Project, SourceFile } from "ts-morph";
import { getRelativeImportPath } from "./getRelativeImportPath";

export type ImporterUpdate = { file: SourceFile; relPath: string };

export function findImporters(
	functionName: string,
	sourceFile: SourceFile,
	destPath: string,
	project: Project,
): ImporterUpdate[] {
	const result: ImporterUpdate[] = [];
	for (const sf of project.getSourceFiles()) {
		if (sf === sourceFile) continue;
		for (const importDecl of sf.getImportDeclarations()) {
			if (importDecl.getModuleSpecifierSourceFile() !== sourceFile) continue;
			if (
				importDecl.getNamedImports().some((ni) => ni.getName() === functionName)
			) {
				result.push({
					file: sf,
					relPath: getRelativeImportPath(sf.getFilePath(), destPath),
				});
			}
		}
	}
	return result;
}
