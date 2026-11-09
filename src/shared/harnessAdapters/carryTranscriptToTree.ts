import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
	findTranscriptPathSync,
	projectDirForCwd,
} from "../../commands/sessions/shared/findTranscriptPathSync";
import { daemonLog } from "../../commands/sessions/daemon/daemonLog";

export function carryTranscriptToTree(
	claudeSessionId: string,
	fromCwd: string,
	toCwd: string,
): void {
	const dir = projectDirForCwd(toCwd);
	if (dir === projectDirForCwd(fromCwd)) {
		daemonLog(
			`transcript ${claudeSessionId} already lives in ${dir}: resuming in the original worktree path`,
		);
		return;
	}
	const dest = join(dir, `${claudeSessionId}.jsonl`);
	if (existsSync(dest)) {
		daemonLog(`transcript ${claudeSessionId} already present in ${dir}`);
		return;
	}
	const source = findTranscriptPathSync(fromCwd, claudeSessionId);
	if (!source) {
		daemonLog(
			`transcript ${claudeSessionId} not found under ${projectDirForCwd(fromCwd)}: resuming in ${toCwd} without it`,
		);
		return;
	}
	try {
		mkdirSync(dir, { recursive: true });
		copyFileSync(source, dest);
		daemonLog(
			`transcript ${source} copied to ${dest} so ${toCwd} can resume it`,
		);
	} catch (error) {
		daemonLog(
			`transcript ${claudeSessionId} could not be copied to ${dir}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
