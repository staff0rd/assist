import chalk from "chalk";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../shared/harnesses";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { appendComment } from "./appendComment";
import { getReady } from "./shared";

export async function verifyResumeConversation(
	itemId: number,
	resumeSessionId: string,
	phaseLabel: string,
	harness?: HarnessKind,
): Promise<boolean> {
	if (await harnessAdapter(harness).conversation.locate(resumeSessionId))
		return true;

	const message = `${phaseLabel}: resume found no conversation for session ${resumeSessionId}; phase not advanced`;
	console.error(chalk.red(`\n${message}`));
	appendDaemonLog(`backlog run ${itemId}: ${message}`);
	try {
		const { orm } = await getReady();
		await appendComment(orm, itemId, `Resume failed — ${message}`);
	} catch {}
	return false;
}
