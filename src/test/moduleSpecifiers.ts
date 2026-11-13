import { readFileSync } from "node:fs";
import ts from "typescript";

export function moduleSpecifiers(file: string): {
	staticImports: string[];
	dynamicImports: string[];
} {
	const source = ts.createSourceFile(
		file,
		readFileSync(file, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const staticImports: string[] = [];
	const dynamicImports: string[] = [];
	const visit = (node: ts.Node): void => {
		if (isStaticImport(node)) staticImports.push(node.moduleSpecifier.text);
		const lazy = dynamicImportSpecifier(node);
		if (lazy) dynamicImports.push(lazy);
		ts.forEachChild(node, visit);
	};
	visit(source);
	return { staticImports, dynamicImports };
}

function isStaticImport(node: ts.Node): node is (
	| ts.ImportDeclaration
	| ts.ExportDeclaration
) & {
	moduleSpecifier: ts.StringLiteral;
} {
	return (
		(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
		!!node.moduleSpecifier &&
		ts.isStringLiteral(node.moduleSpecifier) &&
		!isTypeOnly(node)
	);
}

function dynamicImportSpecifier(node: ts.Node): string | undefined {
	if (
		ts.isCallExpression(node) &&
		node.expression.kind === ts.SyntaxKind.ImportKeyword &&
		node.arguments[0] &&
		ts.isStringLiteral(node.arguments[0])
	) {
		return node.arguments[0].text;
	}
	return undefined;
}

function isTypeOnly(
	node: ts.ImportDeclaration | ts.ExportDeclaration,
): boolean {
	if (ts.isExportDeclaration(node)) return node.isTypeOnly;
	const clause = node.importClause;
	if (!clause) return false;
	if (clause.isTypeOnly) return true;
	const bindings = clause.namedBindings;
	return (
		!clause.name &&
		!!bindings &&
		ts.isNamedImports(bindings) &&
		bindings.elements.length > 0 &&
		bindings.elements.every((e) => e.isTypeOnly)
	);
}
