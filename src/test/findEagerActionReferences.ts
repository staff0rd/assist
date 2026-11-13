import { readFileSync } from "node:fs";
import ts from "typescript";
import { topLevelValueNames } from "./topLevelValueNames";

function isActionCall(node: ts.Node): node is ts.CallExpression {
	return (
		ts.isCallExpression(node) &&
		ts.isPropertyAccessExpression(node.expression) &&
		node.expression.name.text === "action"
	);
}

function isReference(node: ts.Identifier): boolean {
	const parent = node.parent;
	if (ts.isPropertyAccessExpression(parent) && parent.name === node)
		return false;
	if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
	return !(ts.isBindingElement(parent) && parent.propertyName === node);
}

export function findEagerActionReferences(file: string): string[] {
	const source = ts.createSourceFile(
		file,
		readFileSync(file, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const names = topLevelValueNames(source);
	const found: string[] = [];
	const scan = (node: ts.Node): void => {
		if (ts.isIdentifier(node) && names.has(node.text) && isReference(node))
			found.push(node.text);
		ts.forEachChild(node, scan);
	};
	const visit = (node: ts.Node): void => {
		if (isActionCall(node)) for (const arg of node.arguments) scan(arg);
		ts.forEachChild(node, visit);
	};
	visit(source);
	return found;
}
