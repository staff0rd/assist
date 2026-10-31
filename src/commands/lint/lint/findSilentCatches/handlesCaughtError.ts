import { type Node, SyntaxKind } from "ts-morph";

const REPORTER = "reportCaughtError";

function callsReporter(body: Node): boolean {
	return body
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.some((call) => call.getExpression().getText() === REPORTER);
}

function usesBinding(name: string | undefined, body: Node): boolean {
	if (!name) return false;
	return body
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some((id) => id.getText() === name);
}

export function handlesCaughtError(
	name: string | undefined,
	body: Node,
): boolean {
	return callsReporter(body) || usesBinding(name, body);
}
