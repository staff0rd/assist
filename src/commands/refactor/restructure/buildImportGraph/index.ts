import path from "node:path";
import ts from "typescript";
import type { ImportEdge, ImportGraph } from "../types";
import { getImportSpecifiers } from "./getImportSpecifiers";

function loadCompilerOptions(tsConfigPath: string): ts.CompilerOptions {
	const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
	const parsed = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		path.dirname(tsConfigPath),
	);
	return parsed.options;
}

export function buildImportGraph(
	candidateFiles: Set<string>,
	tsConfigPath: string,
): ImportGraph {
	const options = loadCompilerOptions(tsConfigPath);
	const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
	const parsed = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		path.dirname(tsConfigPath),
	);
	const program = ts.createProgram(parsed.fileNames, options);
	const edges: ImportEdge[] = [];
	const importedBy = new Map<string, Set<string>>();
	const imports = new Map<string, Set<string>>();

	for (const sourceFile of program.getSourceFiles()) {
		const filePath = path.resolve(sourceFile.fileName);
		if (filePath.includes("node_modules")) continue;

		for (const specifier of getImportSpecifiers(sourceFile)) {
			if (!specifier.startsWith(".")) continue;
			const resolved = ts.resolveModuleName(
				specifier,
				filePath,
				options,
				ts.sys,
			);
			const resolvedPath = resolved.resolvedModule?.resolvedFileName;
			if (!resolvedPath || resolvedPath.includes("node_modules")) continue;

			const absTarget = path.resolve(resolvedPath);
			edges.push({ source: filePath, target: absTarget, specifier });

			const targetSet = importedBy.get(absTarget) ?? new Set<string>();
			if (!importedBy.has(absTarget)) importedBy.set(absTarget, targetSet);
			targetSet.add(filePath);

			const sourceSet = imports.get(filePath) ?? new Set<string>();
			if (!imports.has(filePath)) imports.set(filePath, sourceSet);
			sourceSet.add(absTarget);
		}
	}

	return { files: candidateFiles, edges, importedBy, imports };
}
