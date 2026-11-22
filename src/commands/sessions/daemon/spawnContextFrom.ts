import type { SpawnContext } from "./types";

export function spawnContextFrom(d: Record<string, unknown>): SpawnContext {
	return {
		launchedFrom:
			(d.launchedFrom as string | undefined) ??
			(d.joinSessionId as string | undefined),
		...(d.yolo === true && { yolo: true }),
	};
}
