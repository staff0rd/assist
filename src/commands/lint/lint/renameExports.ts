import path from "node:path";
import type { Project } from "ts-morph";
import { SyntaxKind } from "ts-morph";

function nameWithoutExtension(filePath: string): string {
	return path.basename(filePath).replace(/\.(ts|tsx)$/, "");
}

export function renameExports(
	project: Project,
	absSource: string,
	absDest: string,
): string[] {
	const oldName = nameWithoutExtension(absSource);
	const newName = nameWithoutExtension(absDest);
	const sourceFile = project.getSourceFile(absSource);
	if (!sourceFile) return [];

	const renamed: string[] = [];
	for (const [, declarations] of sourceFile.getExportedDeclarations()) {
		for (const decl of declarations) {
			// Skip type aliases and interfaces — they should stay PascalCase
			const kind = decl.getKind();
			if (
				kind === SyntaxKind.TypeAliasDeclaration ||
				kind === SyntaxKind.InterfaceDeclaration
			) {
				continue;
			}
			const nameNode = decl.getFirstChildByKind(SyntaxKind.Identifier);
			if (!nameNode || nameNode.getText() !== oldName) continue;
			nameNode.rename(newName);
			renamed.push(`${oldName} → ${newName}`);
		}
	}
	return renamed;
}
