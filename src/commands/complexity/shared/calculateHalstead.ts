import ts from "typescript";

export type HalsteadMetrics = {
	length: number;
	vocabulary: number;
	volume: number;
	difficulty: number;
	effort: number;
	time: number;
	bugsDelivered: number;
};

const operatorChecks: Array<(n: ts.Node) => string | undefined> = [
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

function classifyNode(
	n: ts.Node,
	operators: Map<string, number>,
	operands: Map<string, number>,
): void {
	if (ts.isIdentifier(n) || ts.isNumericLiteral(n) || ts.isStringLiteral(n)) {
		operands.set(n.text, (operands.get(n.text) ?? 0) + 1);
		return;
	}
	for (const check of operatorChecks) {
		const op = check(n);
		if (op !== undefined) {
			operators.set(op, (operators.get(op) ?? 0) + 1);
			return;
		}
	}
}

function computeHalsteadMetrics(
	operators: Map<string, number>,
	operands: Map<string, number>,
): HalsteadMetrics {
	const n1 = operators.size;
	const n2 = operands.size;
	const N1 = Array.from(operators.values()).reduce((a, b) => a + b, 0);
	const N2 = Array.from(operands.values()).reduce((a, b) => a + b, 0);

	const vocabulary = n1 + n2;
	const length = N1 + N2;
	const volume =
		length > 0 && vocabulary > 0 ? length * Math.log2(vocabulary) : 0;
	const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
	const effort = volume * difficulty;

	return {
		length,
		vocabulary,
		volume,
		difficulty,
		effort,
		time: effort / 18,
		bugsDelivered: volume / 3000,
	};
}

export function calculateHalstead(node: ts.Node): HalsteadMetrics {
	const operators = new Map<string, number>();
	const operands = new Map<string, number>();

	function visit(n: ts.Node): void {
		classifyNode(n, operators, operands);
		ts.forEachChild(n, visit);
	}

	ts.forEachChild(node, visit);
	return computeHalsteadMetrics(operators, operands);
}
