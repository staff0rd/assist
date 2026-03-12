import path from "node:path";
import type { Identifier } from "ts-morph";

export function groupReferences(
	symbol: Identifier,
	cwd: string,
): Map<string, number[]> {
	const refs = symbol.findReferencesAsNodes();
	const grouped = new Map<string, number[]>();

	for (const ref of refs) {
		const refFile = path.relative(cwd, ref.getSourceFile().getFilePath());
		const lines = grouped.get(refFile) ?? [];
		if (!grouped.has(refFile)) grouped.set(refFile, lines);
		lines.push(ref.getStartLineNumber());
	}

	return grouped;
}
