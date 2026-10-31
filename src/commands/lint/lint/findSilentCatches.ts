import {
	type CatchClause,
	type Node,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";
import type { LintViolation } from "../shared";
import { handlesCaughtError } from "./findSilentCatches/handlesCaughtError";
import { readsResponseBody } from "./findSilentCatches/readsResponseBody";
import { silentCatchCallbacks } from "./findSilentCatches/silentCatchCallbacks";

const CAPTURE_OPT_OUT = "capture: false";

function awaitsRequest(clause: CatchClause): boolean {
	const tryBlock = clause
		.getParentIfKindOrThrow(SyntaxKind.TryStatement)
		.getTryBlock();
	if (tryBlock.getText().includes(CAPTURE_OPT_OUT)) return false;
	return tryBlock
		.getDescendantsOfKind(SyntaxKind.AwaitExpression)
		.some((awaited) => !readsResponseBody(awaited.getExpression()));
}

function silentCatchClauses(file: SourceFile): Node[] {
	return file.getDescendantsOfKind(SyntaxKind.CatchClause).filter((clause) => {
		const name = clause.getVariableDeclaration()?.getName();
		return (
			awaitsRequest(clause) && !handlesCaughtError(name, clause.getBlock())
		);
	});
}

export function findSilentCatches(file: SourceFile): LintViolation[] {
	const lines = file.getFullText().split("\n");
	return [...silentCatchClauses(file), ...silentCatchCallbacks(file)].map(
		(node) => ({
			filePath: file.getFilePath(),
			line: node.getStartLineNumber(),
			content: lines[node.getStartLineNumber() - 1].trim(),
		}),
	);
}
