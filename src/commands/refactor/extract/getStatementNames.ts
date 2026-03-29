import { type Statement, SyntaxKind } from "ts-morph";

export function getStatementNames(node: Statement): string[] {
	if (node.getKind() === SyntaxKind.VariableStatement) {
		const stmt = node as unknown as {
			getDeclarations(): { getName(): string }[];
		};
		return stmt.getDeclarations().map((d) => d.getName());
	}
	const named = node as unknown as { getName?: () => string };
	return named.getName ? [named.getName()] : [];
}
