import { type Node, SyntaxKind } from "ts-morph";

const BODY_READERS = new Set(["json", "text"]);

export function readsResponseBody(receiver: Node): boolean {
	const method = receiver
		.asKind(SyntaxKind.CallExpression)
		?.getExpression()
		.asKind(SyntaxKind.PropertyAccessExpression)
		?.getName();
	return method !== undefined && BODY_READERS.has(method);
}
