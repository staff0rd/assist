import { formatItemId } from "../../../../../backlog/formatItemId";
import type { SessionInfo } from "../../types";

export function backlogDetail({ activity }: SessionInfo): string | undefined {
	if (activity?.kind !== "backlog" || activity.itemId == null) return undefined;
	const id = formatItemId(activity.itemId);
	if (!activity.phase) return id;
	const of = activity.totalPhases ? ` of ${activity.totalPhases}` : "";
	return `${id} · phase ${activity.phase}${of}`;
}
