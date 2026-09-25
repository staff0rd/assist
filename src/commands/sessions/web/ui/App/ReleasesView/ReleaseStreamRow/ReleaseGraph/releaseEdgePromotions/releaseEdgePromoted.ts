import type { ReleaseNodeState } from "../../../../../../releases/types";
import type { ReleaseLayer } from "../../../releaseLayerLabels";

export function releaseEdgePromoted(
	nodes: Map<string, ReleaseNodeState>,
	layer: ReleaseLayer,
	from: string,
	to: string,
): boolean {
	const source = nodes.get(from);
	const target = nodes.get(to);
	if (!source || !target) return false;
	if (layer === "run") return target.run?.status === "ok";
	if (target.kind !== "environment") return false;
	if (source.kind !== "environment") return target.behind === 0;
	return Boolean(source.live && source.live.sha === target.live?.sha);
}
