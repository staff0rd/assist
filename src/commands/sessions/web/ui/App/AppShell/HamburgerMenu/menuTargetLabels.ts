import { RESTART_ITEM } from "../postRestart";

export function menuTargetLabels(peer: string | undefined) {
	return {
		restartLabel: peer ? `Restart ${peer}` : RESTART_ITEM.label,
		updateLabel: peer ? `Update assist on ${peer}` : "Update assist",
	};
}
