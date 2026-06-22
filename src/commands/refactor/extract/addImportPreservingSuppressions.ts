import {
	type ImportDeclarationStructure,
	type OptionalKind,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";

const suppressionPattern = /^\s*(\/\/|\/\*)\s*oxlint-disable\b/;

function countLeadingSuppressions(sourceFile: SourceFile): number {
	let count = 0;
	for (const stmt of sourceFile.getStatementsWithComments()) {
		const kind = stmt.getKind();
		if (
			(kind === SyntaxKind.SingleLineCommentTrivia ||
				kind === SyntaxKind.MultiLineCommentTrivia) &&
			suppressionPattern.test(stmt.getText())
		) {
			count++;
		} else {
			break;
		}
	}
	return count;
}

export function addImportPreservingSuppressions(
	sourceFile: SourceFile,
	structure: OptionalKind<ImportDeclarationStructure>,
): void {
	if (sourceFile.getImportDeclarations().length > 0) {
		sourceFile.addImportDeclaration(structure);
		return;
	}
	// With no existing imports, ts-morph inserts at index 0 — above any leading
	// file-level suppression comment, which detaches it from the top of file.
	sourceFile.insertImportDeclaration(
		countLeadingSuppressions(sourceFile),
		structure,
	);
}
