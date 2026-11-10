import { useCallback } from "react";
import {
	NODE_SEPARATOR,
	useCloneLocations,
} from "./useNodeClones/useCloneLocations";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export type NodeClone =
	| { kind: "cloned"; cwd: string }
	| { kind: "clonable"; origin: string; cloneTarget: string }
	| { kind: "unavailable" };

export function useNodeClones(
	cwd: string,
	nodes: (string | undefined)[],
	knownOrigin?: string,
): (node: string | undefined) => NodeClone {
	const { cloneOn, originOf } = useRepoSelectionContext();
	const origin = knownOrigin ?? (cwd ? originOf(cwd) : undefined);
	const missingNodes = nodes.filter((node) => !cwd || !cloneOn(cwd, node));
	const missing = missingNodes.length
		? missingNodes.map((node) => node ?? "").join(NODE_SEPARATOR)
		: undefined;
	const locations = useCloneLocations(origin, missing);

	return useCallback(
		(node: string | undefined): NodeClone => {
			const known = cwd ? cloneOn(cwd, node) : undefined;
			if (known) return { kind: "cloned", cwd: known };
			const location =
				locations && locations.origin === origin
					? locations.byNode[node ?? ""]
					: undefined;
			if (location?.cwd) return { kind: "cloned", cwd: location.cwd };
			if (origin && location?.cloneTarget)
				return { kind: "clonable", origin, cloneTarget: location.cloneTarget };
			return { kind: "unavailable" };
		},
		[cwd, cloneOn, origin, locations],
	);
}
