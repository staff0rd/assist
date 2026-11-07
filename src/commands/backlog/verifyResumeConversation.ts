import chalk from "chalk";
import { resolveHarness } from "../../shared/harnessLabel";
import type { HarnessKind } from "../../shared/harnesses";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { findCodexRolloutPath } from "../sessions/shared/codex/findCodexRolloutPath";
import { findSessionJsonlPath } from "../sessions/shared/findSessionJsonlPath";
import { appendComment } from "./appendComment";
import { getReady } from "./shared";

function findConversation(
	resumeSessionId: string,
	harness: HarnessKind | undefined,
): Promise<string | null> {
	return resolveHarness(harness) === "codex"
		? findCodexRolloutPath(resumeSessionId)
		: findSessionJsonlPath(resumeSessionId);
}

export async function verifyResumeConversation(
	itemId: number,
	resumeSessionId: string,
	phaseLabel: string,
	harness?: HarnessKind,
): Promise<boolean> {
	if (await findConversation(resumeSessionId, harness)) return true;

	const message = `${phaseLabel}: resume found no conversation for session ${resumeSessionId}; phase not advanced`;
	console.error(chalk.red(`\n${message}`));
	appendDaemonLog(`backlog run ${itemId}: ${message}`);
	try {
		const { orm } = await getReady();
		await appendComment(orm, itemId, `Resume failed — ${message}`);
	} catch {}
	return false;
}
