import ts from "typescript";

function moduleSpecifierOf(node: ts.Node): ts.Expression | undefined {
	if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
		return node.moduleSpecifier;
	if (
		ts.isCallExpression(node) &&
		node.expression.kind === ts.SyntaxKind.ImportKeyword &&
		node.arguments.length === 1
	)
		return node.arguments[0];
	if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
		return node.argument.literal;
	return undefined;
}

export function getImportSpecifiers(sourceFile: ts.SourceFile): string[] {
	const specifiers: string[] = [];
	const visit = (node: ts.Node): void => {
		const specifier = moduleSpecifierOf(node);
		if (specifier && ts.isStringLiteral(specifier))
			specifiers.push(specifier.text);
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	return specifiers;
}
