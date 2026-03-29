import {
	type FunctionDeclaration,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";

export function findFunction(
	sourceFile: SourceFile,
	functionName: string,
): FunctionDeclaration | undefined {
	return sourceFile
		.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
		.find((fn) => fn.getName() === functionName);
}
