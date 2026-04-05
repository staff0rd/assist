import { type FunctionDeclaration, type Statement, SyntaxKind } from "ts-morph";

function getReferencedIdentifiers(fn: FunctionDeclaration): Set<string> {
	const names = new Set<string>();
	for (const id of fn.getDescendantsOfKind(SyntaxKind.Identifier)) {
		names.add(id.getText());
	}
	return names;
}

export function collectPrivateStatements(
	functions: FunctionDeclaration[],
	stmtMap: Map<string, Statement>,
): Statement[] {
	const seen = new Set<Statement>();
	for (const fn of functions) {
		for (const name of getReferencedIdentifiers(fn)) {
			const stmt = stmtMap.get(name);
			if (stmt) seen.add(stmt);
		}
	}
	return [...seen];
}
