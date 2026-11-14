import { join } from "node:path";
import { daemonPaths } from "./daemonPaths";

export function transcriptEchoPath(conversationId: string): string {
	return join(
		daemonPaths.transcriptEchoes,
		`${conversationId.replace(/[^\w.-]/g, "_")}.jsonl`,
	);
}
