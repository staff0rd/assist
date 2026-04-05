import type { FunctionDeclaration, SourceFile, Statement } from "ts-morph";
import { collectDependencies } from "./collectDependencies";
import { findFunction } from "./findFunction";
import { getExportedDependencyNames } from "./getExportedDependencyNames";
import { getStatementNames } from "./getStatementNames";
import { resolveImports } from "./resolveImports";
import type { RequiredImport } from "./types";

export type TargetAnalysis = {
	target: FunctionDeclaration;
	dependencies: FunctionDeclaration[];
	functionsToRemove: FunctionDeclaration[];
	statementsToCopy: Statement[];
	statementsToRemove: Statement[];
	imports: RequiredImport[];
	exportedDeps: string[];
	extractedNames: string[];
	functionTexts: string[];
};

function extractTexts(
	target: FunctionDeclaration,
	allFunctions: FunctionDeclaration[],
	statements: Statement[],
): string[] {
	const stmtTexts = statements.map((v) => v.getFullText().trim());
	const fnTexts = allFunctions.map((fn) => {
		const text = fn.getFullText().trim();
		if (fn === target && !text.startsWith("export ")) return `export ${text}`;
		return text;
	});
	return [...stmtTexts, ...fnTexts];
}

export function analyseTarget(
	sourceFile: SourceFile,
	functionName: string,
): TargetAnalysis {
	const target = findFunction(sourceFile, functionName);
	if (!target) throw new Error(`Function "${functionName}" not found`);

	const { functions, statements } = collectDependencies(target, sourceFile);
	const all = [target, ...functions.toCopy];

	return {
		target,
		dependencies: functions.toCopy,
		functionsToRemove: functions.toRemove,
		statementsToCopy: statements.toCopy,
		statementsToRemove: statements.toRemove,
		imports: resolveImports(
			target,
			functions.toCopy,
			sourceFile,
			statements.toCopy,
		),
		exportedDeps: getExportedDependencyNames(target, sourceFile),
		extractedNames: [
			...statements.toRemove.flatMap(getStatementNames),
			...([target, ...functions.toRemove]
				.map((fn) => fn.getName())
				.filter(Boolean) as string[]),
		],
		functionTexts: extractTexts(target, all, statements.toCopy),
	};
}
