import {
	type FunctionDeclaration,
	type Node,
	type SourceFile,
	SyntaxKind,
} from "ts-morph";
import { matchImport } from "./matchImport";
import type { RequiredImport } from "./types";

function getReferencedNames(nodes: Node[]): Set<string> {
	const names = new Set<string>();
	for (const node of nodes) {
		for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
			names.add(id.getText());
		}
	}
	return names;
}

function getLocallyDeclaredNames(
	functions: FunctionDeclaration[],
): Set<string> {
	const names = new Set<string>();
	for (const fn of functions) {
		const name = fn.getName();
		if (name) names.add(name);
		for (const param of fn.getParameters()) {
			names.add(param.getName());
		}
		for (const varDecl of fn.getDescendantsOfKind(
			SyntaxKind.VariableDeclaration,
		)) {
			names.add(varDecl.getName());
		}
	}
	return names;
}

export function resolveImports(
	target: FunctionDeclaration,
	dependencies: FunctionDeclaration[],
	sourceFile: SourceFile,
	statements: Node[] = [],
): RequiredImport[] {
	const allFunctions = [target, ...dependencies];
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
