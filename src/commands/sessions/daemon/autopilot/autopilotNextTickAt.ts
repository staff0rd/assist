import type { AutopilotRepoRecord } from "./AutopilotRecord";

export function autopilotNextTickAt(
	repo: AutopilotRepoRecord,
	intervalMinutes: number,
): number {
	const last = [...repo.ticks]
		.reverse()
		.find((tick) => tick.outcome !== "finished");
	const scheduled = last ? Date.parse(last.at) + intervalMinutes * 60_000 : 0;
	return repo.followUp
		? Math.min(scheduled, Date.parse(repo.followUp.at))
		: scheduled;
}
