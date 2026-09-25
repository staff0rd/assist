import type { ReleaseNodeState } from "../../../../../../../releases/types";
import { releaseEdgePromoted } from "./releaseEdgePromotions/releaseEdgePromoted";
import type { ReleaseLayer } from "../../releaseLayerLabels";

export function releaseEdgePromotions(
	nodes: ReleaseNodeState[],
	edges: [string, string][],
	layer: ReleaseLayer,
): boolean[] {
	const byId = new Map(nodes.map((node) => [node.id, node]));
	return edges.map(([from, to]) => releaseEdgePromoted(byId, layer, from, to));
}
