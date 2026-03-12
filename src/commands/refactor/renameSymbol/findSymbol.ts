import type { Identifier, SourceFile } from "ts-morph";
import { SyntaxKind } from "ts-morph";

const declarationKinds = [
	SyntaxKind.VariableDeclaration,
	SyntaxKind.FunctionDeclaration,
	SyntaxKind.ClassDeclaration,
	SyntaxKind.InterfaceDeclaration,
	SyntaxKind.TypeAliasDeclaration,
	SyntaxKind.EnumDeclaration,
	SyntaxKind.PropertyDeclaration,
	SyntaxKind.MethodDeclaration,
	SyntaxKind.Parameter,
];

function isDeclaration(identifier: Identifier): boolean {
	const parent = identifier.getParent();
	return parent !== undefined && declarationKinds.includes(parent.getKind());
}

export function findSymbol(
	sourceFile: SourceFile,
	symbolName: string,
): Identifier | undefined {
	for (const id of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
		if (id.getText() === symbolName && isDeclaration(id)) return id;
	}
	return undefined;
}
