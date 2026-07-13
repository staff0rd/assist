import { type SourceFile, SyntaxKind } from "ts-morph";
import { findFunction } from "./findFunction";
import type { ExtractTarget } from "./types";

export function findTarget(
	sourceFile: SourceFile,
	name: string,
): ExtractTarget | undefined {
	const fn = findFunction(sourceFile, name);
	if (fn) return fn;

	for (const stmt of sourceFile.getVariableStatements()) {
		for (const decl of stmt.getDeclarations()) {
			if (decl.getName() !== name) continue;
			const init = decl.getInitializer();
			const kind = init?.getKind();
			if (
				kind === SyntaxKind.ArrowFunction ||
				kind === SyntaxKind.FunctionExpression
			) {
				return stmt;
			}
		}
	}

	return undefined;
}
