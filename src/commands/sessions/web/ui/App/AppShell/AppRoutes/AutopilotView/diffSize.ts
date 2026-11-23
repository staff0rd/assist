import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

export function diffSize(item: AutopilotItemView): string {
	const commits = `${item.commits} commit${item.commits === 1 ? "" : "s"}`;
	return `${commits} · +${item.insertions} −${item.deletions}`;
}
