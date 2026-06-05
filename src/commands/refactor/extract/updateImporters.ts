import type { SourceFile } from "ts-morph";
import { addImportPreservingSuppressions } from "./addImportPreservingSuppressions";

export function updateImporters(
	functionName: string,
	sourceFile: SourceFile,
	importers: { file: SourceFile; relPath: string }[],
): void {
	for (const { file: importerFile, relPath } of importers) {
		let alias: string | undefined;

		for (const importDecl of importerFile.getImportDeclarations()) {
			if (importDecl.getModuleSpecifierSourceFile() !== sourceFile) continue;
			for (const ni of importDecl.getNamedImports()) {
				if (ni.getName() === functionName) {
					alias = ni.getAliasNode()?.getText();
					ni.remove();
					break;
				}
			}
			if (
				importDecl.getNamedImports().length === 0 &&
				!importDecl.getDefaultImport() &&
				!importDecl.getNamespaceImport()
			) {
				importDecl.remove();
			}
		}

		addImportPreservingSuppressions(importerFile, {
			moduleSpecifier: relPath,
			namedImports: [alias ? { name: functionName, alias } : functionName],
		});
	}
}
