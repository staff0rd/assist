import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ts from "typescript";
import { findSourceFiles } from "../findSourceFiles";
import { getNodeName, hasFunctionBody } from "./getNodeName";

export type ThresholdOptions = {
	threshold?: number;
};

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
	const files = findSourceFiles(pattern);
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

export { calculateCyclomaticComplexity } from "./calculateCyclomaticComplexity";
export {
	calculateHalstead,
	type HalsteadMetrics,
} from "./calculateHalstead";
export { countSloc } from "./countSloc";
