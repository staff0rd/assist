import ts from "typescript";

export function getNodeName(node: ts.Node): string {
	if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
		return node.name?.text ?? "<anonymous>";
	}
	if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
		if (ts.isIdentifier(node.name)) {
			return node.name.text;
		}
		if (ts.isStringLiteral(node.name)) {
			return node.name.text;
		}
		return "<computed>";
	}
	if (ts.isArrowFunction(node)) {
		const parent = node.parent;
		if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
			return parent.name.text;
		}
		if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
			return parent.name.text;
		}
		return "<arrow>";
	}
	if (ts.isGetAccessor(node) || ts.isSetAccessor(node)) {
		const prefix = ts.isGetAccessor(node) ? "get " : "set ";
		if (ts.isIdentifier(node.name)) {
			return `${prefix}${node.name.text}`;
		}
		return `${prefix}<computed>`;
	}
	if (ts.isConstructorDeclaration(node)) {
		return "constructor";
	}
	return "<unknown>";
}

export function hasFunctionBody(
	node: ts.Node,
): node is
	| ts.FunctionDeclaration
	| ts.FunctionExpression
	| ts.ArrowFunction
	| ts.MethodDeclaration
	| ts.GetAccessorDeclaration
	| ts.SetAccessorDeclaration
	| ts.ConstructorDeclaration {
	if (
		ts.isFunctionDeclaration(node) ||
		ts.isFunctionExpression(node) ||
		ts.isArrowFunction(node) ||
		ts.isMethodDeclaration(node) ||
		ts.isGetAccessor(node) ||
		ts.isSetAccessor(node) ||
		ts.isConstructorDeclaration(node)
	) {
		return node.body !== undefined;
	}
	return false;
}
