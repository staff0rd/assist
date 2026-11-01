import { addDays, isoWeek } from "../isoWeek";
import type { RepoRow } from "./types";

export function getRepoStatus(
	lastPush: string,
	lastWeek: string | null,
	today: string,
): RepoRow["status"] {
	if (!lastWeek) return "missing";
	const latestCompletedWeek = isoWeek(addDays(today, -7));
	const pushedAfterLastWeek = isoWeek(lastPush) > lastWeek;
	return pushedAfterLastWeek && lastWeek < latestCompletedWeek
		? "outdated"
		: "ok";
}
