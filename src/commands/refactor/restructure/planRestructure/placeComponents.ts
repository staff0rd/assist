import path from "node:path";
import { findStronglyConnectedComponents } from "./findStronglyConnectedComponents";
import { lowestCommonAncestor } from "./lowestCommonAncestor";
import { moduleStem } from "./moduleStem";
import type { Anchor, Anchoring } from "./types";

type Placement = { dir: string; reason: string };

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

function componentDir(
	component: string[],
	anchorings: Map<string, Anchoring>,
	dirs: Map<string, string>,
	scopeRoot: string,
): string {
	if (component.some((f) => (anchorings.get(f) as Anchoring).root))
		return scopeRoot;
	const anchors = externalAnchors(component, anchorings);
	if (anchors.length === 0) return scopeRoot;
	return lowestCommonAncestor(anchors.map((a) => anchorFolder(a, dirs)));
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
	const dirs = new Map<string, string>();
	const placements = new Map<string, Placement>();
	for (const component of findStronglyConnectedComponents(files, successors)) {
		const dir = componentDir(component, anchorings, dirs, scopeRoot);
		for (const file of component) {
			dirs.set(file, dir);
			const base = (anchorings.get(file) as Anchoring).reason;
			placements.set(file, {
				dir,
				reason: componentReason(file, component, base),
			});
		}
	}
	return placements;
}
