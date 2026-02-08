import ts from "typescript";

const complexityKinds = new Set([
	ts.SyntaxKind.IfStatement,
	ts.SyntaxKind.ForStatement,
	ts.SyntaxKind.ForInStatement,
	ts.SyntaxKind.ForOfStatement,
	ts.SyntaxKind.WhileStatement,
	ts.SyntaxKind.DoStatement,
	ts.SyntaxKind.CaseClause,
	ts.SyntaxKind.CatchClause,
	ts.SyntaxKind.ConditionalExpression,
]);

const logicalOperators = new Set([
	ts.SyntaxKind.AmpersandAmpersandToken,
	ts.SyntaxKind.BarBarToken,
	ts.SyntaxKind.QuestionQuestionToken,
]);

export function calculateCyclomaticComplexity(node: ts.Node): number {
	let complexity = 1;

	function visit(n: ts.Node): void {
		if (complexityKinds.has(n.kind)) {
			complexity++;
		} else if (
			ts.isBinaryExpression(n) &&
			logicalOperators.has(n.operatorToken.kind)
		) {
			complexity++;
		}
		ts.forEachChild(n, visit);
	}

	ts.forEachChild(node, visit);
	return complexity;
}
