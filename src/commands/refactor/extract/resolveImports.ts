import {
	type FunctionDeclaration,
	Node,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";
import { matchImport } from "./matchImport";
import type { ExtractTarget, RequiredImport } from "./types";

function getReferencedNames(nodes: Node[]): Set<string> {
	const names = new Set<string>();
	for (const node of nodes) {
		for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
			names.add(id.getText());
		}
	}
	return names;
}

function getLocallyDeclaredNames(nodes: Node[]): Set<string> {
	const names = new Set<string>();
	for (const node of nodes) {
		if (Node.isFunctionDeclaration(node)) {
			const name = node.getName();
			if (name) names.add(name);
		}
		for (const param of node.getDescendantsOfKind(SyntaxKind.Parameter)) {
			names.add(param.getName());
		}
		for (const varDecl of node.getDescendantsOfKind(
			SyntaxKind.VariableDeclaration,
		)) {
			names.add(varDecl.getName());
		}
	}
	return names;
}

export function resolveImports(
	target: ExtractTarget,
	dependencies: FunctionDeclaration[],
	sourceFile: SourceFile,
	statements: Node[] = [],
): RequiredImport[] {
	const allFunctions: Node[] = [target, ...dependencies];
	const allNodes: Node[] = [...allFunctions, ...statements];
	const referencedNames = getReferencedNames(allNodes);
	const localNames = getLocallyDeclaredNames(allFunctions);

	const externalNames = new Set<string>();
	for (const name of referencedNames) {
		if (!localNames.has(name)) externalNames.add(name);
	}

	const result: RequiredImport[] = [];
	for (const importDecl of sourceFile.getImportDeclarations()) {
		const matched = matchImport(importDecl, externalNames);
		if (matched) result.push(matched);
	}

	return result;
}
