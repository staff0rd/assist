import { formatItemId } from "../../../../../../../backlog/formatItemId";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { clockTime } from "./clockTime";

export function lastRunHeading(run: AutopilotTick): string {
	const span = run.startedAt
		? `${clockTime(run.startedAt)}–${clockTime(run.at)}`
		: clockTime(run.at);
	const items = run.items?.length
		? `started ${run.items.map(formatItemId).join(", ")}`
		: "started no item";
	return [span, items, run.reason].filter(Boolean).join(" · ");
}
