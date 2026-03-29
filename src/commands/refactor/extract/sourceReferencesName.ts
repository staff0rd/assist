import { type Node, type SourceFile, SyntaxKind } from "ts-morph";

const DECLARATION_KINDS = new Set([
	SyntaxKind.FunctionDeclaration,
	SyntaxKind.ImportSpecifier,
	SyntaxKind.ExportSpecifier,
]);

function isInsideExtractedFunction(
	node: Node,
	extracted: Set<string>,
): boolean {
	let current: Node | undefined = node;
	while (current) {
		if (current.getKind() !== SyntaxKind.FunctionDeclaration) {
			current = current.getParent();
			continue;
		}
		const name = (current as { getName?: () => string }).getName?.();
		if (name && extracted.has(name)) return true;
		current = current.getParent();
	}
	return false;
}

export function sourceReferencesName(
	sourceFile: SourceFile,
	functionName: string,
	extractedNames: string[],
): boolean {
	const extracted = new Set(extractedNames);

	for (const id of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
		if (id.getText() !== functionName) continue;
		const parent = id.getParent();
		if (!parent || DECLARATION_KINDS.has(parent.getKind())) continue;
		if (!isInsideExtractedFunction(parent, extracted)) return true;
	}

	return false;
}
