import path from "node:path";
import ts from "typescript";
import type { ImportEdge } from "../types";
import { specifiersOf } from "./specifiersOf";

function resolveImport(
	specifier: string,
	filePath: string,
	options: ts.CompilerOptions,
): string | null {
	if (!specifier.startsWith(".")) return null;
	const resolved = ts.resolveModuleName(specifier, filePath, options, ts.sys);
	const resolvedPath = resolved.resolvedModule?.resolvedFileName;
	if (!resolvedPath || resolvedPath.includes("node_modules")) return null;
	return path.resolve(resolvedPath);
}

export function collectSourceFileEdges(
	sourceFile: ts.SourceFile,
	options: ts.CompilerOptions,
	includeMocks: boolean,
): ImportEdge[] {
	const source = path.resolve(sourceFile.fileName);
	return specifiersOf(sourceFile, includeMocks).flatMap(
		({ specifier, mock }) => {
			const target = resolveImport(specifier, source, options);
			if (!target) return [];
			return [{ source, target, specifier, ...(mock && { mock }) }];
		},
	);
}
