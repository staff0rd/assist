import { randomUUID } from "node:crypto";
import chalk from "chalk";
import { CLAUDE_SPAWN_FAILED } from "../../shared/awaitClaude";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { launchPhaseSession } from "./launchPhaseSession";
import { persistPhaseSessionId } from "./persistPhaseSessionId";
import { recordSignalOwner } from "./recordSignalOwner";
import { reportPhaseActivity } from "./reportPhaseActivity";
import { resolvePhaseResult } from "./resolvePhaseResult";
import type { BacklogItem, PlanPhase } from "./types";
import { verifyPhaseResume } from "./verifyPhaseResume";

export async function executePhase(
	item: BacklogItem,
	phaseIndex: number,
	phases: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
	// The auto-appended review phase isn't in the authored `phases` array during
	// the authored run, so callers pass the review-inclusive total to keep the
	// count stable (e.g. 1/3, 2/3, then 3/3 for review) rather than jumping.
	totalPhases: number = phases.length,
): Promise<number> {
	const phase = phases[phaseIndex];
	const phaseNumber = phaseIndex + 1;
	console.log(
		chalk.bold(
			`\n--- Phase ${phaseNumber}/${totalPhases}: ${phase.name} ---\n`,
		),
	);

	/* why: a fresh phase gets a new id we assign so the daemon knows exactly
	 * which transcript to resume on restart; a resumed phase keeps the
	 * interrupted conversation's id. Either way it is reported via activity. */
	const resumeSessionId = spawnOptions?.resumeSessionId;
	const claudeSessionId = resumeSessionId ?? randomUUID();

	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	process.env.ASSIST_BACKLOG_ITEM_ID = String(item.id);
	recordSignalOwner(item.id);

	const phaseLabel = `phase ${phaseNumber}/${totalPhases}`;
	if (resumeSessionId) {
		if (!(await verifyPhaseResume(item.id, resumeSessionId, phaseLabel)))
			return -1;
	}

	reportPhaseActivity(item, phaseNumber, totalPhases, phase, claudeSessionId);
	if (!resumeSessionId) {
		await persistPhaseSessionId(item.id, phaseIndex, claudeSessionId);
	}
	const exitCode = await launchPhaseSession(
		item,
		phaseNumber,
		phase,
		phaseLabel,
		claudeSessionId,
		spawnOptions,
	);
	/* why: abort the phase loop on a spawn failure rather than surfacing an
	 * uncaught rejection or retrying a launch that can't succeed */
	if (exitCode === CLAUDE_SPAWN_FAILED) return -1;

	/* why: the phase Claude has exited, so its hooks no longer drive the daemon
	 * card; the driver now works (resolve result, reload plan, spawn the next
	 * phase) with no claude alive, leaving the card stuck on the last Stop's
	 * `waiting`. Push `running` explicitly so the card reflects the active driver
	 * work instead of the daemon guessing from PTY output (#447/#449). This only
	 * runs once a phase Claude has exited — the review phase keeps its Claude
	 * alive awaiting input, so awaitClaude blocks above and this never fires,
	 * leaving its `waiting` intact. */
	void setSessionStatus("running");

	return await resolvePhaseResult(phaseIndex, item.id);
}
