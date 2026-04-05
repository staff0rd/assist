import {
	type FunctionDeclaration,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";

export function getFunctionMap(
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
