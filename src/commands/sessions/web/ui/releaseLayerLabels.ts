export type ReleaseLayer = "live" | "run";

export const releaseLayerLabels: Record<ReleaseLayer, string> = {
	live: "What's live",
	run: "Latest run",
};
