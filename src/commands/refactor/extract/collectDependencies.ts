import {
	type FunctionDeclaration,
	type SourceFile,
	type Statement,
	SyntaxKind,
} from "ts-morph";
import { collectPrivateFunctions } from "./collectPrivateFunctions";
import { getPrivateStatementMap } from "./getPrivateStatementMap";

function getReferencedIdentifiers(fn: FunctionDeclaration): Set<string> {
	const names = new Set<string>();
	for (const id of fn.getDescendantsOfKind(SyntaxKind.Identifier)) {
		names.add(id.getText());
	}
	return names;
}

function getFunctionMap(
	sourceFile: SourceFile,
): Map<string, FunctionDeclaration> {
	const map = new Map<string, FunctionDeclaration>();
	for (const fn of sourceFile.getDescendantsOfKind(
		SyntaxKind.FunctionDeclaration,
	)) {
		const name = fn.getName();
		if (name) map.set(name, fn);
	}
	return map;
}

function collectPrivateStatements(
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

function getRemainingFunctions(
	sourceFile: SourceFile,
	extracted: Set<FunctionDeclaration>,
): FunctionDeclaration[] {
	return sourceFile
		.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
		.filter((fn) => !extracted.has(fn));
}

type StatementDeps = {
	toCopy: Statement[];
	toRemove: Statement[];
};

export function collectDependencies(
	target: FunctionDeclaration,
	sourceFile: SourceFile,
): { functions: FunctionDeclaration[]; statements: StatementDeps } {
	const fnMap = getFunctionMap(sourceFile);
	const depFunctions = collectPrivateFunctions(target, fnMap);
	const allExtracted = [target, ...depFunctions];
	const stmtMap = getPrivateStatementMap(sourceFile);

	const toCopy = collectPrivateStatements(allExtracted, stmtMap);
	const extractedSet = new Set(allExtracted);
	const remaining = getRemainingFunctions(sourceFile, extractedSet);
	const usedByRemaining = new Set(collectPrivateStatements(remaining, stmtMap));
	const toRemove = toCopy.filter((s) => !usedByRemaining.has(s));

	return {
		functions: depFunctions,
		statements: { toCopy, toRemove },
	};
}
