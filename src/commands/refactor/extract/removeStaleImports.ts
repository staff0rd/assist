import type { ImportDeclaration, SourceFile } from "ts-morph";
import { SyntaxKind } from "ts-morph";

function collectReferencedNames(sourceFile: SourceFile): Set<string> {
	const names = new Set<string>();
	for (const id of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
		names.add(id.getText());
	}
	return names;
}

function isImportEmpty(
	importDecl: ImportDeclaration,
	usedNames: Set<string>,
): boolean {
	if (importDecl.getNamedImports().length > 0) return false;
	const def = importDecl.getDefaultImport();
	if (def && usedNames.has(def.getText())) return false;
	const ns = importDecl.getNamespaceImport();
	if (ns && usedNames.has(ns.getText())) return false;
	return true;
}

export function removeStaleImports(sourceFile: SourceFile): void {
	const usedNames = collectReferencedNames(sourceFile);

	for (const importDecl of sourceFile.getImportDeclarations()) {
		for (const ni of importDecl.getNamedImports()) {
			const name = ni.getAliasNode()?.getText() ?? ni.getName();
			if (!usedNames.has(name)) ni.remove();
		}

		if (isImportEmpty(importDecl, usedNames)) {
			importDecl.remove();
		}
	}
}
