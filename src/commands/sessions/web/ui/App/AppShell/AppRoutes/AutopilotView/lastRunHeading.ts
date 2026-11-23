import { formatItemId } from "../../../../../../../backlog/formatItemId";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { clockTime } from "./clockTime";
import { runTime } from "./runTime";

export function lastRunHeading(run: AutopilotTick): string {
	const span = run.startedAt
		? `${runTime(run.startedAt)}–${clockTime(run.at)}`
		: runTime(run.at);
	const items = run.items?.length
		? `started ${run.items.map(formatItemId).join(", ")}`
		: "started no item";
	return [span, items, run.reason].filter(Boolean).join(" · ");
}
