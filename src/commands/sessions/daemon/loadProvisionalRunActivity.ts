import { getDb } from "../../../shared/db/getDb";
import type { Activity } from "../../../shared/emitActivity";
import { loadConfig } from "../../../shared/loadConfig";
import { formatItemId } from "../../backlog/formatItemId";
import { loadItem } from "../../backlog/loadItem";
import { provisionalRunActivity } from "../../backlog/provisionalRunActivity";
import { daemonLog } from "./daemonLog";

export async function loadProvisionalRunActivity(
	itemId: number,
): Promise<Omit<Activity, "startedAt"> | undefined> {
	const label = `provisional activity for ${formatItemId(itemId)}`;
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) {
			daemonLog(`${label} skipped: no database configured`);
			return undefined;
		}
		const item = await loadItem(await getDb(), itemId);
		if (!item) {
			daemonLog(`${label} skipped: item not found`);
			return undefined;
		}
		const activity = provisionalRunActivity(item);
		if (!activity) daemonLog(`${label} skipped: no phase left to run`);
		return activity;
	} catch (error) {
		daemonLog(`${label} lookup failed: ${String(error)}`);
		return undefined;
	}
}
