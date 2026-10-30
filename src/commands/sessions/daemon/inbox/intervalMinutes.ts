import { readInboxIntervalMinutes } from "../../../inbox/readInboxIntervalMinutes";
import { daemonLog } from "../daemonLog";

export function intervalMinutes(): number | undefined {
	try {
		return readInboxIntervalMinutes();
	} catch (error) {
		daemonLog(
			`inbox: ignoring invalid inbox.intervalMinutes: ${errorText(error)}`,
		);
		return undefined;
	}
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
