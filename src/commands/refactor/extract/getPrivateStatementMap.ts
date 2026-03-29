import type { SourceFile, Statement } from "ts-morph";

export function getPrivateStatementMap(
	sourceFile: SourceFile,
): Map<string, Statement> {
	const map = new Map<string, Statement>();
	for (const stmt of sourceFile.getVariableStatements()) {
		if (stmt.isExported()) continue;
		for (const decl of stmt.getDeclarations()) map.set(decl.getName(), stmt);
	}
	for (const alias of sourceFile.getTypeAliases()) {
		if (!alias.isExported()) map.set(alias.getName(), alias);
	}
	for (const iface of sourceFile.getInterfaces()) {
		if (!iface.isExported()) map.set(iface.getName(), iface);
	}
	return map;
}
