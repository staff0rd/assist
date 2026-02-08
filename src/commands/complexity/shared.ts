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

export { calculateCyclomaticComplexity } from "./calculateCyclomaticComplexity.js";
export {
	calculateHalstead,
	type HalsteadMetrics,
} from "./calculateHalstead.js";
export { countSloc } from "./countSloc.js";
