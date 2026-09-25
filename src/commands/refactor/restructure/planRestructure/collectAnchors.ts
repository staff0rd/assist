import path from "node:path";
import type { EdgeIndex } from "./indexEdges";
import { isTestFile, testStem } from "./isTestFile";
import { moduleStem } from "./moduleStem";
import type { Anchor, Anchoring, AnchorMode } from "./types";

function sorted(set: Set<string> | undefined): string[] {
	return [...(set ?? [])].sort();
}

function names(files: string[]): string {
	return files.map((f) => path.basename(f)).join(", ");
}

function anchorsOf(files: string[], mode: AnchorMode): Anchor[] {
	return files.map((file) => ({ file, mode }));
}

function root(reason: string): Anchoring {
	return { root: true, anchors: [], reason };
}

function anchorTest(file: string, index: EdgeIndex): Anchoring {
	const imported = sorted(index.imports.get(file));
	if (imported.length === 0) return root("test with no subject in scope");
	const stem = testStem(file);
	const subjects = imported.filter(
		(f) => !isTestFile(f) && moduleStem(f) === stem,
	);
	const anchors = subjects.length > 0 ? subjects : imported;
	return {
		root: false,
		anchors: anchorsOf(anchors, "sibling"),
		reason: `test of ${names(anchors)}`,
	};
}

function anchorModule(file: string, index: EdgeIndex): Anchoring {
	if (index.external.has(file)) return root("imported from outside scope");
	const importers = sorted(index.importers.get(file));
	if (importers.length > 0)
		return {
			root: false,
			anchors: anchorsOf(importers, "child"),
			reason:
				importers.length === 1
					? `imported only by ${names(importers)}`
					: `shared by ${names(importers)}`,
		};
	const tests = sorted(index.testImporters.get(file));
	if (tests.length > 0)
		return {
			root: false,
			anchors: anchorsOf(tests, "sibling"),
			reason: `used only by tests ${names(tests)}`,
		};
	return root("no importers in scope");
}

export function collectAnchors(
	files: string[],
	index: EdgeIndex,
): Map<string, Anchoring> {
	const anchorings = new Map<string, Anchoring>();
	for (const file of files)
		anchorings.set(
			file,
			isTestFile(file) ? anchorTest(file, index) : anchorModule(file, index),
		);
	return anchorings;
}
