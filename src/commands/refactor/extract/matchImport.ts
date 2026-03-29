import type { ImportDeclaration } from "ts-morph";
import type { RequiredImport } from "./types";

function matchNamedImports(
	importDecl: ImportDeclaration,
	neededNames: Set<string>,
): string[] {
	const matched: string[] = [];
	for (const specifier of importDecl.getNamedImports()) {
		const name = specifier.getAliasNode()?.getText() ?? specifier.getName();
		if (!neededNames.has(name)) continue;
		const original = specifier.getName();
		const alias = specifier.getAliasNode()?.getText();
		matched.push(alias ? `${original} as ${alias}` : original);
	}
	return matched;
}

function matchOptionalImport(
	node: { getText(): string } | undefined,
	neededNames: Set<string>,
): string | undefined {
	return node && neededNames.has(node.getText()) ? node.getText() : undefined;
}

export function matchImport(
	importDecl: ImportDeclaration,
	neededNames: Set<string>,
): RequiredImport | undefined {
	const namedImports = matchNamedImports(importDecl, neededNames);
	const defaultImport = matchOptionalImport(
		importDecl.getDefaultImport(),
		neededNames,
	);
	const namespaceImport = matchOptionalImport(
		importDecl.getNamespaceImport(),
		neededNames,
	);

	if (namedImports.length === 0 && !defaultImport && !namespaceImport) {
		return undefined;
	}

	return {
		moduleSpecifier: importDecl.getModuleSpecifierValue(),
		namedImports,
		defaultImport,
		namespaceImport,
		isTypeOnly: importDecl.isTypeOnly(),
	};
}
