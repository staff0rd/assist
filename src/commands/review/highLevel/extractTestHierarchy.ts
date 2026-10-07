import { type CallExpression, Node, Project } from "ts-morph";
import { classifyTestCall } from "./classifyTestCall";
import type { HighLevelTestCase, HighLevelTestNode } from "./types";
import { dedentedSource } from "./dedentedSource";
import { testName } from "./testName";

type Context = { path: string; changed?: Set<number> };

function touchesChange(call: CallExpression, changed?: Set<number>): boolean {
	if (!changed) return true;
	for (
		let line = call.getStartLineNumber();
		line <= call.getEndLineNumber();
		line++
	)
		if (changed.has(line)) return true;
	return false;
}

function toCase(call: CallExpression, context: Context): HighLevelTestCase {
	const line = call.getStartLineNumber();
	return {
		kind: "it",
		id: `${context.path}:${line}`,
		name: testName(call),
		line,
		source: dedentedSource(call),
	};
}

function collect(node: Node, context: Context): HighLevelTestNode[] {
	const found: HighLevelTestNode[] = [];
	node.forEachChild((child) => {
		found.push(...visit(child, context));
	});
	return found;
}

function visit(node: Node, context: Context): HighLevelTestNode[] {
	if (!Node.isCallExpression(node)) return collect(node, context);
	const kind = classifyTestCall(node);
	if (kind === "it")
		return touchesChange(node, context.changed) ? [toCase(node, context)] : [];
	if (kind === undefined) return collect(node, context);
	const children = node
		.getArguments()
		.slice(1)
		.flatMap((argument) => visit(argument, context));
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
	changed?: Set<number>,
): HighLevelTestNode[] {
	const project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: { allowJs: true },
	});
	const source = project.createSourceFile(`/${path}`, text);
	return collect(source, { path, ...(changed ? { changed } : {}) });
}
