import { loadConfig } from "../../../../shared/loadConfig";
import { readInboxIntervalMinutes } from "../../../inbox/readInboxIntervalMinutes";

export type InboxSchedule = { intervalMinutes?: number; description: string };

export function readInboxSchedule(): InboxSchedule {
	let minutes: number | undefined;
	try {
		minutes = readInboxIntervalMinutes();
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		return { description: `off (invalid inbox.intervalMinutes: ${reason})` };
	}
	if (!minutes) return { description: "off (inbox.intervalMinutes unset)" };
	if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
		return { description: "off (no database configured)" };
	return {
		intervalMinutes: minutes,
		description: `every ${minutes} minute(s)`,
	};
}
