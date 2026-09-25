import type { ImportDeclaration } from "ts-morph";
import type { RequiredImport } from "./types";

type MatchedName = { text: string; isTypeOnly: boolean };

function matchNamedImports(
	importDecl: ImportDeclaration,
	neededNames: Set<string>,
): MatchedName[] {
	const matched: MatchedName[] = [];
	for (const specifier of importDecl.getNamedImports()) {
		const name = specifier.getAliasNode()?.getText() ?? specifier.getName();
		if (!neededNames.has(name)) continue;
		const original = specifier.getName();
		const alias = specifier.getAliasNode()?.getText();
		matched.push({
			text: alias ? `${original} as ${alias}` : original,
			isTypeOnly: specifier.isTypeOnly(),
		});
	}
	return matched;
}

function formatNamedImports(
	matched: MatchedName[],
	collapseToTypeOnly: boolean,
): string[] {
	return matched.map(({ text, isTypeOnly }) =>
		isTypeOnly && !collapseToTypeOnly ? `type ${text}` : text,
	);
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

	const allNamedTypeOnly =
		!defaultImport &&
		!namespaceImport &&
		namedImports.every((named) => named.isTypeOnly);
	return {
		moduleSpecifier: importDecl.getModuleSpecifierValue(),
		namedImports: formatNamedImports(namedImports, allNamedTypeOnly),
		defaultImport,
		namespaceImport,
		isTypeOnly: importDecl.isTypeOnly() || allNamedTypeOnly,
	};
}
