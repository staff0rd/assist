import { anchored } from "./anchored";
import type { EdgeIndex } from "./indexEdges";
import { isTestFile, testStem } from "./isTestFile";
import { moduleStem } from "./moduleStem";
import type { Anchoring } from "./types";

function sorted(set: Set<string> | undefined): string[] {
	return [...(set ?? [])].sort();
}

function root(reason: string): Anchoring {
	return { root: true, anchors: [], reason };
}

function pin(anchoring: Anchoring): Anchoring {
	if (anchoring.root) return anchoring;
	return { ...anchoring, pinned: true, reason: `pinned; ${anchoring.reason}` };
}

function anchorTest(file: string, index: EdgeIndex): Anchoring {
	const imported = sorted(index.imports.get(file));
	if (imported.length === 0) return root("test with no subject in scope");
	const stem = testStem(file);
	const subjects = imported.filter(
		(f) => !isTestFile(f) && moduleStem(f) === stem,
	);
	return anchored(
		subjects.length > 0 ? subjects : imported,
		"sibling",
		"test of",
	);
}

function anchorModule(file: string, index: EdgeIndex): Anchoring {
	if (index.external.has(file)) return root("imported from outside scope");
	const importers = sorted(index.importers.get(file));
	if (importers.length > 0)
		return anchored(
			importers,
			"child",
			importers.length === 1 ? "imported only by" : "shared by",
		);
	const tests = sorted(index.testImporters.get(file));
	if (tests.length > 0) return anchored(tests, "sibling", "used only by tests");
	return root("no importers in scope");
}

function anchorFile(
	file: string,
	index: EdgeIndex,
	pinned: Set<string>,
): Anchoring {
	if (isTestFile(file)) return anchorTest(file, index);
	const anchoring = anchorModule(file, index);
	return pinned.has(moduleStem(file)) ? pin(anchoring) : anchoring;
}

export function collectAnchors(
	files: string[],
	index: EdgeIndex,
	pinned: Set<string>,
): Map<string, Anchoring> {
	return new Map(files.map((file) => [file, anchorFile(file, index, pinned)]));
}
