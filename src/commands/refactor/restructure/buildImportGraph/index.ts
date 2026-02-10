import path from "node:path";
import ts from "typescript";
import type { ImportEdge, ImportGraph } from "../types";
import { getImportSpecifiers } from "./getImportSpecifiers";

function loadParsedConfig(tsConfigPath: string): ts.ParsedCommandLine {
	const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
	return ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		path.dirname(tsConfigPath),
	);
}

function addToSetMap(
	map: Map<string, Set<string>>,
	key: string,
	value: string,
): void {
	let set = map.get(key);
	if (!set) {
		set = new Set<string>();
		map.set(key, set);
	}
	set.add(value);
}

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

export function buildImportGraph(
	candidateFiles: Set<string>,
	tsConfigPath: string,
): ImportGraph {
	const parsed = loadParsedConfig(tsConfigPath);
	const program = ts.createProgram(parsed.fileNames, parsed.options);
	const edges: ImportEdge[] = [];
	const importedBy = new Map<string, Set<string>>();
	const imports = new Map<string, Set<string>>();

	for (const sourceFile of program.getSourceFiles()) {
		const filePath = path.resolve(sourceFile.fileName);
		if (filePath.includes("node_modules")) continue;

		for (const specifier of getImportSpecifiers(sourceFile)) {
			const absTarget = resolveImport(specifier, filePath, parsed.options);
			if (!absTarget) continue;

			edges.push({ source: filePath, target: absTarget, specifier });
			addToSetMap(importedBy, absTarget, filePath);
			addToSetMap(imports, filePath, absTarget);
		}
	}

	return { files: candidateFiles, edges, importedBy, imports };
}
