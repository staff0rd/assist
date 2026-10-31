import type { BrowserReply, ConsoleRequest } from "../browserLink/types";
import { isRecordingConsole } from "./isRecordingConsole";
import { readConsoleEntries } from "./readConsoleEntries";
import { CONSOLE_DEFAULT_LIMIT } from "./types";

export async function answerConsoleRequest(
	request: ConsoleRequest,
	tab?: { id: number; url: string },
): Promise<BrowserReply> {
	const recording = await isRecordingConsole();
	const entries = recording
		? await readConsoleEntries({
				tabId: tab?.id,
				since:
					request.sinceMs === undefined
						? undefined
						: Date.now() - request.sinceMs,
				grep: request.grep,
				limit: request.limit ?? CONSOLE_DEFAULT_LIMIT,
			})
		: [];
	return { ok: true, result: { tabUrl: tab?.url ?? "", recording, entries } };
}
