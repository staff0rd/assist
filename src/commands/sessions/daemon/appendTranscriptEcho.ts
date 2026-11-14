import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { TranscriptEcho } from "../shared/transcriptMessages";
import { daemonLog } from "./daemonLog";
import { transcriptEchoPath } from "./transcriptEchoPath";

export function appendTranscriptEcho(
	conversationId: string,
	echo: TranscriptEcho,
): void {
	const path = transcriptEchoPath(conversationId);
	try {
		mkdirSync(dirname(path), { recursive: true });
		appendFileSync(path, `${JSON.stringify(echo)}\n`);
	} catch (error) {
		daemonLog(`transcript echo write failed: ${path}: ${String(error)}`);
	}
}
