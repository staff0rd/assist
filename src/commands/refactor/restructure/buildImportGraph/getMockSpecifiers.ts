import ts from "typescript";

const MOCK_METHODS = new Set([
	"mock",
	"doMock",
	"unmock",
	"doUnmock",
	"importActual",
	"importMock",
]);

function isViMockCall(node: ts.CallExpression): boolean {
	const callee = node.expression;
	return (
		ts.isPropertyAccessExpression(callee) &&
		ts.isIdentifier(callee.expression) &&
		callee.expression.text === "vi" &&
		MOCK_METHODS.has(callee.name.text)
	);
}

export function getMockSpecifiers(sourceFile: ts.SourceFile): string[] {
	const specifiers: string[] = [];
	const visit = (node: ts.Node): void => {
		if (ts.isCallExpression(node) && isViMockCall(node)) {
			const [first] = node.arguments;
			if (first && ts.isStringLiteral(first)) specifiers.push(first.text);
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	return specifiers;
}
