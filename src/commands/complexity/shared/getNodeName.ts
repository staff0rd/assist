import ts from "typescript";

type FunctionLikeNode =
	| ts.FunctionDeclaration
	| ts.FunctionExpression
	| ts.ArrowFunction
	| ts.MethodDeclaration
	| ts.GetAccessorDeclaration
	| ts.SetAccessorDeclaration
	| ts.ConstructorDeclaration;

const FUNCTION_TYPE_CHECKS: ((node: ts.Node) => boolean)[] = [
	ts.isFunctionDeclaration,
	ts.isFunctionExpression,
	ts.isArrowFunction,
	ts.isMethodDeclaration,
	ts.isGetAccessor,
	ts.isSetAccessor,
	ts.isConstructorDeclaration,
];

function getIdentifierText(name: ts.PropertyName): string {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
	return "<computed>";
}

function getArrowFunctionName(node: ts.ArrowFunction): string {
	const { parent } = node;
	if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name))
		return parent.name.text;
	if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name))
		return parent.name.text;
	return "<arrow>";
}

export function getNodeName(node: ts.Node): string {
	if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node))
		return node.name?.text ?? "<anonymous>";
	if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node))
		return getIdentifierText(node.name);
	if (ts.isArrowFunction(node)) return getArrowFunctionName(node);
	if (ts.isGetAccessor(node) || ts.isSetAccessor(node)) {
		const prefix = ts.isGetAccessor(node) ? "get " : "set ";
		return `${prefix}${getIdentifierText(node.name)}`;
	}
	if (ts.isConstructorDeclaration(node)) return "constructor";
	return "<unknown>";
}

export function hasFunctionBody(node: ts.Node): node is FunctionLikeNode {
	if (!FUNCTION_TYPE_CHECKS.some((check) => check(node))) return false;
	return (node as FunctionLikeNode).body !== undefined;
}
