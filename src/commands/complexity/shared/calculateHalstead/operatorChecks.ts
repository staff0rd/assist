import ts from "typescript";

export const operatorChecks: Array<(n: ts.Node) => string | undefined> = [
	(n) => (ts.isBinaryExpression(n) ? n.operatorToken.getText() : undefined),
	(n) =>
		ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)
			? (ts.tokenToString(n.operator) ?? "")
			: undefined,
	(n) => (ts.isCallExpression(n) ? "()" : undefined),
	(n) => (ts.isPropertyAccessExpression(n) ? "." : undefined),
	(n) => (ts.isElementAccessExpression(n) ? "[]" : undefined),
	(n) => (ts.isConditionalExpression(n) ? "?:" : undefined),
	(n) => (ts.isReturnStatement(n) ? "return" : undefined),
	(n) => (ts.isIfStatement(n) ? "if" : undefined),
	(n) =>
		ts.isForStatement(n) || ts.isForInStatement(n) || ts.isForOfStatement(n)
			? "for"
			: undefined,
	(n) => (ts.isWhileStatement(n) ? "while" : undefined),
	(n) => (ts.isDoStatement(n) ? "do" : undefined),
	(n) => (ts.isSwitchStatement(n) ? "switch" : undefined),
	(n) => (ts.isCaseClause(n) ? "case" : undefined),
	(n) => (ts.isDefaultClause(n) ? "default" : undefined),
	(n) => (ts.isBreakStatement(n) ? "break" : undefined),
	(n) => (ts.isContinueStatement(n) ? "continue" : undefined),
	(n) => (ts.isThrowStatement(n) ? "throw" : undefined),
	(n) => (ts.isTryStatement(n) ? "try" : undefined),
	(n) => (ts.isCatchClause(n) ? "catch" : undefined),
	(n) => (ts.isNewExpression(n) ? "new" : undefined),
	(n) => (ts.isTypeOfExpression(n) ? "typeof" : undefined),
	(n) => (ts.isAwaitExpression(n) ? "await" : undefined),
];
