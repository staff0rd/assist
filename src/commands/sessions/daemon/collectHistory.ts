import { discoverSessions } from "../shared/discoverSessions";
import type { HistoricalSession } from "../shared/parseSessionFile";
import { withRepoGroups } from "./withRepoGroups";

export async function collectHistory(
	linked: Promise<HistoricalSession[]> | HistoricalSession[],
): Promise<HistoricalSession[]> {
	const [local, remote] = await Promise.all([discoverSessions(), linked]);
	return withRepoGroups(local).concat(remote);
}
