import type { Node, SourceFile } from "ts-morph";
import { SyntaxKind } from "ts-morph";

export function getExportedDependencyNames(
	target: Node,
	sourceFile: SourceFile,
): string[] {
	const calledNames = new Set<string>();
	for (const call of target.getDescendantsOfKind(SyntaxKind.CallExpression)) {
		const expr = call.getExpression();
		if (expr.getKind() === SyntaxKind.Identifier) {
			calledNames.add(expr.getText());
		}
	}

	const exported: string[] = [];
	for (const fn of sourceFile.getDescendantsOfKind(
		SyntaxKind.FunctionDeclaration,
	)) {
		const name = fn.getName();
		if (name && calledNames.has(name) && fn.isExported()) {
			exported.push(name);
		}
	}
	return exported;
}
