import { Node, Project } from "ts-morph";
import { classifyTestCall } from "./classifyTestCall";
import type { HighLevelTestNode } from "./types";
import { testName } from "./testName";
import { visitCase } from "./visitCase";

function collect(node: Node, path: string): HighLevelTestNode[] {
	const found: HighLevelTestNode[] = [];
	node.forEachChild((child) => {
		found.push(...visit(child, path));
	});
	return found;
}

function visit(node: Node, path: string): HighLevelTestNode[] {
	if (!Node.isCallExpression(node)) return collect(node, path);
	const kind = classifyTestCall(node);
	if (kind === "it") return [visitCase(node, path)];
	if (kind === undefined) return collect(node, path);
	const children = node
		.getArguments()
		.slice(1)
		.flatMap((argument) => visit(argument, path));
	if (children.length === 0) return [];
	return [
		{
			kind: "describe",
			name: testName(node),
			line: node.getStartLineNumber(),
			children,
		},
	];
}

export function extractTestHierarchy(
	path: string,
	text: string,
): HighLevelTestNode[] {
	const project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: { allowJs: true },
	});
	const source = project.createSourceFile(`/${path}`, text);
	return collect(source, path);
}
