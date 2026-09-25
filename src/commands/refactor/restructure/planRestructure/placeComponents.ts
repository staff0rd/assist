import path from "node:path";
import { componentDir, type Layout } from "./componentDir";
import { findStronglyConnectedComponents } from "./findStronglyConnectedComponents";
import { moduleStem } from "./moduleStem";
import type { Anchoring } from "./types";

type Placement = { dir: string; reason: string };

function isPinFolderOwner(anchoring: Anchoring): boolean {
	return anchoring.root || anchoring.pinned === true;
}

function componentReason(
	file: string,
	component: string[],
	base: string,
): string {
	if (component.length === 1) return base;
	const others = component
		.filter((f) => f !== file)
		.map((f) => path.basename(f));
	return `${base}; cycle with ${others.join(", ")}`;
}

export function placeComponents(
	files: string[],
	anchorings: Map<string, Anchoring>,
	scopeRoot: string,
): Map<string, Placement> {
	const successors = (file: string) =>
		(anchorings.get(file) as Anchoring).anchors.map((a) => a.file);
	const layout: Layout = { scopeRoot, dirs: new Map(), pinFolders: new Set() };
	const placements = new Map<string, Placement>();
	for (const component of findStronglyConnectedComponents(files, successors)) {
		const dir = componentDir(component, anchorings, layout);
		for (const file of component) {
			const anchoring = anchorings.get(file) as Anchoring;
			layout.dirs.set(file, dir);
			if (isPinFolderOwner(anchoring))
				layout.pinFolders.add(path.join(dir, moduleStem(file)));
			placements.set(file, {
				dir,
				reason: componentReason(file, component, anchoring.reason),
			});
		}
	}
	return placements;
}
