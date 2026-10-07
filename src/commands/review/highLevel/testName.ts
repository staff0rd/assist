import { type CallExpression, Node } from "ts-morph";

export function testName(call: CallExpression): string {
	const [first] = call.getArguments();
	if (
		Node.isStringLiteral(first) ||
		Node.isNoSubstitutionTemplateLiteral(first)
	)
		return first.getLiteralValue();
	if (Node.isTemplateExpression(first)) return first.getText().slice(1, -1);
	return first?.getText() ?? "";
}
