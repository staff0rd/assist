import { formatItemId } from "../backlog/formatItemId";
import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";

export function formatLastRun(
	status: AutopilotStatus,
	time: (iso: string) => string,
): string[] {
	const run = status.runs[0];
	if (!run) return [`No finished autopilot run recorded for ${status.cwd}.`];
	const items = run.items?.map(formatItemId).join(", ") || "none";
	const summary = run.summary
		? [
				`  Checked:  ${run.summary.checked}`,
				`  Decided:  ${run.summary.decided}`,
				`  Started:  ${run.summary.started}`,
				`  Next:     ${run.summary.next}`,
			]
		: ["  Summary:  none recorded"];
	return [
		`Last run: ${run.startedAt ? `${time(run.startedAt)} to ` : ""}${time(run.at)}`,
		...summary,
		`  Items:    ${items}`,
	];
}
