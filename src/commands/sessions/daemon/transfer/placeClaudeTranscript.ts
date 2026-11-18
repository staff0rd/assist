import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { projectDirForCwd } from "../../shared/findTranscriptPathSync";
import { daemonLog } from "../daemonLog";
import type { TransferredConversation } from "./TransferredConversation";

export async function placeClaudeTranscript(
	conversation: TransferredConversation,
	cwd: string,
): Promise<string> {
	const dir = projectDirForCwd(cwd);
	const dest = join(dir, `${conversation.id}.jsonl`);
	await mkdir(dir, { recursive: true });
	await writeFile(dest, conversation.transcript);
	daemonLog(
		`transcript ${conversation.id} placed at ${dest} so ${cwd} can resume it`,
	);
	return dest;
}
