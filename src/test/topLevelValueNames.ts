import ts from "typescript";

export function topLevelValueNames(source: ts.SourceFile): Set<string> {
	const names = new Set<string>();
	for (const statement of source.statements) {
		if (ts.isImportDeclaration(statement)) {
			const clause = statement.importClause;
			if (!clause || clause.isTypeOnly || isLazyActionImport(statement))
				continue;
			if (clause.name) names.add(clause.name.text);
			const bindings = clause.namedBindings;
			if (bindings && ts.isNamespaceImport(bindings))
				names.add(bindings.name.text);
			if (bindings && ts.isNamedImports(bindings))
				for (const element of bindings.elements)
					if (!element.isTypeOnly) names.add(element.name.text);
		} else if (ts.isFunctionDeclaration(statement) && statement.name) {
			names.add(statement.name.text);
		} else if (ts.isVariableStatement(statement)) {
			for (const declaration of statement.declarationList.declarations)
				if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
		}
	}
	return names;
}

function isLazyActionImport(statement: ts.ImportDeclaration): boolean {
	const specifier = statement.moduleSpecifier;
	return (
		ts.isStringLiteral(specifier) && specifier.text.endsWith("/lazyAction")
	);
}
