import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { minimatch } from "minimatch";
import ts from "typescript";

export type ThresholdOptions = {
	threshold?: number;
};

function getNodeName(node: ts.Node): string {
	if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
		return node.name?.text ?? "<anonymous>";
	}
	if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
		if (ts.isIdentifier(node.name)) {
			return node.name.text;
		}
		if (ts.isStringLiteral(node.name)) {
			return node.name.text;
		}
		return "<computed>";
	}
	if (ts.isArrowFunction(node)) {
		const parent = node.parent;
		if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
			return parent.name.text;
		}
		if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
			return parent.name.text;
		}
		return "<arrow>";
	}
	if (ts.isGetAccessor(node) || ts.isSetAccessor(node)) {
		const prefix = ts.isGetAccessor(node) ? "get " : "set ";
		if (ts.isIdentifier(node.name)) {
			return `${prefix}${node.name.text}`;
		}
		return `${prefix}<computed>`;
	}
	if (ts.isConstructorDeclaration(node)) {
		return "constructor";
	}
	return "<unknown>";
}

function createSourceFromFile(filePath: string): ts.SourceFile {
	const content = fs.readFileSync(filePath, "utf-8");
	return ts.createSourceFile(
		path.basename(filePath),
		content,
		ts.ScriptTarget.Latest,
		true,
		filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

export function withSourceFiles<T>(
	pattern: string,
	callback: (files: string[]) => T,
): T | undefined {
	const files = findSourceFilesWithPattern(pattern);
	if (files.length === 0) {
		console.log(chalk.yellow("No files found matching pattern"));
		return undefined;
	}
	return callback(files);
}

export function forEachFunction(
	files: string[],
	callback: (file: string, name: string, node: ts.Node) => void,
): void {
	for (const file of files) {
		const sourceFile = createSourceFromFile(file);
		const visit = (node: ts.Node): void => {
			if (hasFunctionBody(node)) {
				callback(file, getNodeName(node), node);
			}
			ts.forEachChild(node, visit);
		};
		visit(sourceFile);
	}
}

function findSourceFilesWithPattern(pattern: string, baseDir = "."): string[] {
	const results: string[] = [];
	const extensions = [".ts", ".tsx"];

	function walk(dir: string): void {
		if (!fs.existsSync(dir)) {
			return;
		}
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (entry.name !== "node_modules" && entry.name !== ".git") {
					walk(fullPath);
				}
			} else if (
				entry.isFile() &&
				extensions.some((ext) => entry.name.endsWith(ext))
			) {
				results.push(fullPath);
			}
		}
	}

	if (pattern.includes("*")) {
		walk(baseDir);
		return results.filter((f) => minimatch(f, pattern));
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
		return [pattern];
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()) {
		walk(pattern);
		return results;
	}

	walk(baseDir);
	return results.filter((f) => minimatch(f, pattern));
}

function hasFunctionBody(
	node: ts.Node,
): node is
	| ts.FunctionDeclaration
	| ts.FunctionExpression
	| ts.ArrowFunction
	| ts.MethodDeclaration
	| ts.GetAccessorDeclaration
	| ts.SetAccessorDeclaration
	| ts.ConstructorDeclaration {
	if (
		ts.isFunctionDeclaration(node) ||
		ts.isFunctionExpression(node) ||
		ts.isArrowFunction(node) ||
		ts.isMethodDeclaration(node) ||
		ts.isGetAccessor(node) ||
		ts.isSetAccessor(node) ||
		ts.isConstructorDeclaration(node)
	) {
		return node.body !== undefined;
	}
	return false;
}

export function countSloc(content: string): number {
	let inMultiLineComment = false;
	let count = 0;

	const lines = content.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();

		if (inMultiLineComment) {
			if (trimmed.includes("*/")) {
				inMultiLineComment = false;
				const afterComment = trimmed.substring(trimmed.indexOf("*/") + 2);
				if (afterComment.trim().length > 0) {
					count++;
				}
			}
			continue;
		}

		if (trimmed.startsWith("//")) {
			continue;
		}

		if (trimmed.startsWith("/*")) {
			if (trimmed.includes("*/")) {
				const afterComment = trimmed.substring(trimmed.indexOf("*/") + 2);
				if (afterComment.trim().length > 0) {
					count++;
				}
			} else {
				inMultiLineComment = true;
			}
			continue;
		}

		if (trimmed.length > 0) {
			count++;
		}
	}

	return count;
}

export function calculateCyclomaticComplexity(node: ts.Node): number {
	let complexity = 1;

	function visit(n: ts.Node): void {
		switch (n.kind) {
			case ts.SyntaxKind.IfStatement:
			case ts.SyntaxKind.ForStatement:
			case ts.SyntaxKind.ForInStatement:
			case ts.SyntaxKind.ForOfStatement:
			case ts.SyntaxKind.WhileStatement:
			case ts.SyntaxKind.DoStatement:
			case ts.SyntaxKind.CaseClause:
			case ts.SyntaxKind.CatchClause:
			case ts.SyntaxKind.ConditionalExpression:
				complexity++;
				break;
			case ts.SyntaxKind.BinaryExpression: {
				const binary = n as ts.BinaryExpression;
				if (
					binary.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
					binary.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
					binary.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
				) {
					complexity++;
				}
				break;
			}
		}
		ts.forEachChild(n, visit);
	}

	ts.forEachChild(node, visit);
	return complexity;
}

export type HalsteadMetrics = {
	length: number;
	vocabulary: number;
	volume: number;
	difficulty: number;
	effort: number;
	time: number;
	bugsDelivered: number;
};

export function calculateHalstead(node: ts.Node): HalsteadMetrics {
	const operators = new Map<string, number>();
	const operands = new Map<string, number>();

	function addOperator(op: string): void {
		operators.set(op, (operators.get(op) ?? 0) + 1);
	}

	function addOperand(op: string): void {
		operands.set(op, (operands.get(op) ?? 0) + 1);
	}

	function visit(n: ts.Node): void {
		if (ts.isIdentifier(n)) {
			addOperand(n.text);
		} else if (ts.isNumericLiteral(n)) {
			addOperand(n.text);
		} else if (ts.isStringLiteral(n)) {
			addOperand(n.text);
		} else if (ts.isBinaryExpression(n)) {
			addOperator(n.operatorToken.getText());
		} else if (
			ts.isPrefixUnaryExpression(n) ||
			ts.isPostfixUnaryExpression(n)
		) {
			addOperator(ts.tokenToString(n.operator) ?? "");
		} else if (ts.isCallExpression(n)) {
			addOperator("()");
		} else if (ts.isPropertyAccessExpression(n)) {
			addOperator(".");
		} else if (ts.isElementAccessExpression(n)) {
			addOperator("[]");
		} else if (ts.isConditionalExpression(n)) {
			addOperator("?:");
		} else if (ts.isReturnStatement(n)) {
			addOperator("return");
		} else if (ts.isIfStatement(n)) {
			addOperator("if");
		} else if (
			ts.isForStatement(n) ||
			ts.isForInStatement(n) ||
			ts.isForOfStatement(n)
		) {
			addOperator("for");
		} else if (ts.isWhileStatement(n)) {
			addOperator("while");
		} else if (ts.isDoStatement(n)) {
			addOperator("do");
		} else if (ts.isSwitchStatement(n)) {
			addOperator("switch");
		} else if (ts.isCaseClause(n)) {
			addOperator("case");
		} else if (ts.isDefaultClause(n)) {
			addOperator("default");
		} else if (ts.isBreakStatement(n)) {
			addOperator("break");
		} else if (ts.isContinueStatement(n)) {
			addOperator("continue");
		} else if (ts.isThrowStatement(n)) {
			addOperator("throw");
		} else if (ts.isTryStatement(n)) {
			addOperator("try");
		} else if (ts.isCatchClause(n)) {
			addOperator("catch");
		} else if (ts.isNewExpression(n)) {
			addOperator("new");
		} else if (ts.isTypeOfExpression(n)) {
			addOperator("typeof");
		} else if (ts.isAwaitExpression(n)) {
			addOperator("await");
		}

		ts.forEachChild(n, visit);
	}

	ts.forEachChild(node, visit);

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
	const time = effort / 18;
	const bugsDelivered = volume / 3000;

	return {
		length,
		vocabulary,
		volume,
		difficulty,
		effort,
		time,
		bugsDelivered,
	};
}
