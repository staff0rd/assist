import type { ReleaseStreamState } from "../../../../../../releases/types";
import type { ReleaseLayer } from "../releaseLayerLabels";
import { releaseLivePills } from "./releaseSummaryPills/releaseLivePills";
import type { ReleasePill } from "./releasePill";
import { releaseRunPills } from "./releaseSummaryPills/releaseRunPills";

export function releaseSummaryPills(
	stream: ReleaseStreamState,
	layer: ReleaseLayer,
): ReleasePill[] {
	const environments = stream.nodes.filter(
		(node) => node.kind === "environment",
	);
	if (environments.length === 0) return [];
	return layer === "run"
		? releaseRunPills(environments)
		: releaseLivePills(
				environments,
				stream.defaultBranch ?? "the default branch",
			);
}
