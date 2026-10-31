import { type Node, type SourceFile, SyntaxKind } from "ts-morph";
import { handlesCaughtError } from "./handlesCaughtError";
import { readsResponseBody } from "./readsResponseBody";

export function silentCatchCallbacks(file: SourceFile): Node[] {
	return file
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.filter((call) => {
			const access = call
				.getExpression()
				.asKind(SyntaxKind.PropertyAccessExpression);
			if (access?.getName() !== "catch") return false;
			if (readsResponseBody(access.getExpression())) return false;
			const handler =
				call.getArguments()[0]?.asKind(SyntaxKind.ArrowFunction) ??
				call.getArguments()[0]?.asKind(SyntaxKind.FunctionExpression);
			if (!handler) return false;
			const name = handler.getParameters()[0]?.getName();
			return !handlesCaughtError(name, handler.getBody());
		})
		.map((call) =>
			call
				.getExpressionIfKindOrThrow(SyntaxKind.PropertyAccessExpression)
				.getNameNode(),
		);
}
