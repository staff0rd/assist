import type { FileMove } from "../types";

export type PlannerEdge = { source: string; target: string };

export type PlannerInput = {
	scopeRoot: string;
	files: string[];
	edges: PlannerEdge[];
	pinnedModules?: string[];
	fixedFiles?: string[];
};

export type AnchorMode = "child" | "sibling" | "fixed";

export type Anchor = { file: string; mode: AnchorMode };

export type Anchoring = {
	root: boolean;
	pinned?: boolean;
	anchors: Anchor[];
	reason: string;
};

export type PlannerResult = {
	targets: Map<string, string>;
	moves: FileMove[];
	errors: string[];
};
