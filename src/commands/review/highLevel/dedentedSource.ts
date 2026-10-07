import type { CallExpression } from "ts-morph";

export function dedentedSource(call: CallExpression): string {
	const text = call.getSourceFile().getFullText();
	const lineStart = text.lastIndexOf("\n", call.getStart()) + 1;
	const indent = /^\s*/.exec(text.slice(lineStart, call.getStart()))?.[0] ?? "";
	return call
		.getText()
		.split("\n")
		.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
		.join("\n");
}
