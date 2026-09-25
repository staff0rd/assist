import path from "node:path";
import ts from "typescript";
import type { ImportEdge, ImportGraph } from "../types";
import { collectSourceFileEdges } from "./collectSourceFileEdges";

type BuildImportGraphOptions = { includeMocks?: boolean };

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

export function buildImportGraph(
	candidateFiles: Set<string>,
	tsConfigPath: string,
	options: BuildImportGraphOptions = {},
): ImportGraph {
	const parsed = loadParsedConfig(tsConfigPath);
	const program = ts.createProgram(parsed.fileNames, parsed.options);
	const edges: ImportEdge[] = [];
	const importedBy = new Map<string, Set<string>>();
	const imports = new Map<string, Set<string>>();

	for (const sourceFile of program.getSourceFiles()) {
		if (sourceFile.fileName.includes("node_modules")) continue;
		for (const edge of collectSourceFileEdges(
			sourceFile,
			parsed.options,
			options.includeMocks ?? false,
		)) {
			edges.push(edge);
			addToSetMap(importedBy, edge.target, edge.source);
			addToSetMap(imports, edge.source, edge.target);
		}
	}

	return { files: candidateFiles, edges, importedBy, imports };
}
