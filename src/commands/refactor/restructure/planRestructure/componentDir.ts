import path from "node:path";
import { liftToPinFolder } from "./liftToPinFolder";
import { lowestCommonAncestor } from "./lowestCommonAncestor";
import { moduleStem } from "./moduleStem";
import type { Anchor, Anchoring } from "./types";

export type Layout = {
	scopeRoot: string;
	dirs: Map<string, string>;
	pinFolders: Set<string>;
};

function anchorFolder(anchor: Anchor, dirs: Map<string, string>): string {
	const dir = dirs.get(anchor.file) as string;
	return anchor.mode === "child"
		? path.join(dir, moduleStem(anchor.file))
		: dir;
}

function externalAnchors(
	component: string[],
	anchorings: Map<string, Anchoring>,
): Anchor[] {
	const members = new Set(component);
	return component.flatMap((file) =>
		(anchorings.get(file) as Anchoring).anchors.filter(
			(a) => !members.has(a.file),
		),
	);
}

function plannedDir(
	component: string[],
	anchorings: Map<string, Anchoring>,
	layout: Layout,
): string {
	if (component.some((f) => (anchorings.get(f) as Anchoring).root))
		return layout.scopeRoot;
	const anchors = externalAnchors(component, anchorings);
	if (anchors.length === 0) return layout.scopeRoot;
	return lowestCommonAncestor(anchors.map((a) => anchorFolder(a, layout.dirs)));
}

export function componentDir(
	component: string[],
	anchorings: Map<string, Anchoring>,
	layout: Layout,
): string {
	const planned = plannedDir(component, anchorings, layout);
	const pinned = component.some((f) => (anchorings.get(f) as Anchoring).pinned);
	return pinned
		? liftToPinFolder(planned, layout.pinFolders, layout.scopeRoot)
		: planned;
}
