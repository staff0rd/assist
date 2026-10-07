import { type CallExpression, type Expression, Node } from "ts-morph";

const SUITE_ROOTS = new Set(["describe", "context", "suite"]);
const CASE_ROOTS = new Set(["it", "test", "specify"]);

function calleeChain(expression: Expression): string[] {
	if (Node.isIdentifier(expression)) return [expression.getText()];
	if (Node.isPropertyAccessExpression(expression))
		return [...calleeChain(expression.getExpression()), expression.getName()];
	if (Node.isCallExpression(expression))
		return calleeChain(expression.getExpression());
	return [];
}

function hasName(call: CallExpression): boolean {
	const [first] = call.getArguments();
	return (
		first !== undefined &&
		!Node.isFunctionLikeDeclaration(first) &&
		!Node.isObjectLiteralExpression(first)
	);
}

export function classifyTestCall(
	call: CallExpression,
): "describe" | "it" | undefined {
	const [root, ...rest] = calleeChain(call.getExpression());
	if (root === undefined || !hasName(call)) return undefined;
	if (SUITE_ROOTS.has(root) || rest.includes("describe")) return "describe";
	if (CASE_ROOTS.has(root)) return "it";
	return undefined;
}
