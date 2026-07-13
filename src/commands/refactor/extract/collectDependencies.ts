import {
	type FunctionDeclaration,
	type Node,
	type SourceFile,
	type Statement,
	SyntaxKind,
} from "ts-morph";
import { collectPrivateFunctions } from "./collectPrivateFunctions";
import { collectPrivateStatements } from "./collectPrivateStatements";
import { getFunctionMap } from "./getFunctionMap";
import { getPrivateStatementMap } from "./getPrivateStatementMap";
import type { ExtractTarget } from "./types";

type CopyRemove<T> = {
	toCopy: T[];
	toRemove: T[];
};

function getRemainingFunctions(
	sourceFile: SourceFile,
	extracted: Set<Node>,
): FunctionDeclaration[] {
	return sourceFile
		.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
		.filter((fn) => !extracted.has(fn));
}

function collectFnsUsedByRemaining(
	remaining: FunctionDeclaration[],
	fnMap: Map<string, FunctionDeclaration>,
): Set<FunctionDeclaration> {
	const used = new Set<FunctionDeclaration>();
	for (const fn of remaining) {
		for (const dep of collectPrivateFunctions(fn, fnMap)) {
			used.add(dep);
		}
	}
	return used;
}

export function collectDependencies(
	target: ExtractTarget,
	sourceFile: SourceFile,
): {
	functions: CopyRemove<FunctionDeclaration>;
	statements: CopyRemove<Statement>;
} {
	const fnMap = getFunctionMap(sourceFile);
	const depFunctions = collectPrivateFunctions(target, fnMap);
	const allExtracted: Node[] = [target, ...depFunctions];
	const stmtMap = getPrivateStatementMap(sourceFile);
	const stmtsToCopy = collectPrivateStatements(allExtracted, stmtMap);

	const remaining = getRemainingFunctions(sourceFile, new Set(allExtracted));
	const fnsUsedByRemaining = collectFnsUsedByRemaining(remaining, fnMap);
	const fnsToRemove = depFunctions.filter((fn) => !fnsUsedByRemaining.has(fn));

	const staysInSource = [
		...remaining,
		...depFunctions.filter((fn) => fnsUsedByRemaining.has(fn)),
	];
	const stmtsToRemove = stmtsToCopy.filter(
		(s) => !new Set(collectPrivateStatements(staysInSource, stmtMap)).has(s),
	);

	return {
		functions: { toCopy: depFunctions, toRemove: fnsToRemove },
		statements: { toCopy: stmtsToCopy, toRemove: stmtsToRemove },
	};
}
