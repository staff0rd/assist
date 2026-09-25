import type { ReleaseLayer } from "../releaseLayerLabels";
import type { ReleaseTone } from "../releaseToneColors";

type ReleaseLegendItem = {
	mark: string;
	tone: ReleaseTone;
	label: string;
	tooltip: string;
};

const liveItems: ReleaseLegendItem[] = [
	{
		mark: "●",
		tone: "ok",
		label: "current",
		tooltip: "Running the latest commit on the default branch",
	},
	{
		mark: "◑",
		tone: "gate",
		label: "gated",
		tooltip: "Behind, with a newer commit waiting for someone to approve",
	},
	{
		mark: "▲",
		tone: "drift",
		label: "behind",
		tooltip: "Behind the default branch, and nothing is queued to fix it",
	},
	{
		mark: "○",
		tone: "idle",
		label: "no deploy",
		tooltip:
			"No successful deployment recorded, or a build or approval step rather than an environment",
	},
	{
		mark: "queued",
		tone: "gate",
		label: "next in line",
		tooltip: "Built and queued, but not live — waiting for approval",
	},
	{
		mark: "−n",
		tone: "drift",
		label: "behind by n",
		tooltip: "Commits on the default branch this environment has not got yet",
	},
];

const runItems: ReleaseLegendItem[] = [
	{
		mark: "✔",
		tone: "ok",
		label: "done",
		tooltip: "Built or deployed by this run",
	},
	{
		mark: "◑",
		tone: "gate",
		label: "gated",
		tooltip: "Waiting for someone to approve this deploy",
	},
	{
		mark: "●",
		tone: "gate",
		label: "running",
		tooltip: "Running now",
	},
	{
		mark: "✕",
		tone: "fail",
		label: "failed",
		tooltip: "This job failed in the latest run",
	},
	{
		mark: "○",
		tone: "idle",
		label: "untouched",
		tooltip: "This run never got here",
	},
];

export function releaseLegendItems(layer: ReleaseLayer): ReleaseLegendItem[] {
	return layer === "run" ? runItems : liveItems;
}
