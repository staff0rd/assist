import chalk from "chalk";
import { HARNESS_SPAWN_FAILED } from "../../shared/awaitHarness";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { launchPhaseSession } from "./launchPhaseSession";
import { recordSignalOwner } from "./recordSignalOwner";
import { type PhaseOutcome, resolvePhaseResult } from "./resolvePhaseResult";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";
import { preparePhaseSession } from "./preparePhaseSession";

export async function executePhase(
	item: BacklogItem,
	phaseIndex: number,
	phases: PlanPhase[],
	spawnOptions?: BacklogRunOptions,
	// The auto-appended review phase isn't in the authored `phases` array during
	// the authored run, so callers pass the review-inclusive total to keep the
	// count stable (e.g. 1/3, 2/3, then 3/3 for review) rather than jumping.
	totalPhases: number = phases.length,
): Promise<PhaseOutcome> {
	const phase = phases[phaseIndex];
	const phaseNumber = phaseIndex + 1;
	console.log(
		chalk.bold(
			`\n--- Phase ${phaseNumber}/${totalPhases}: ${phase.name} ---\n`,
		),
	);

	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	process.env.ASSIST_BACKLOG_ITEM_ID = String(item.id);
	recordSignalOwner(item.id);

	const phaseLabel = `phase ${phaseNumber}/${totalPhases}`;
	const phaseSession = await preparePhaseSession(
		item,
		phase,
		phaseIndex,
		phaseNumber,
		totalPhases,
		phaseLabel,
		spawnOptions,
	);
	if (!phaseSession) return { kind: "abort" };
	const exitCode = await launchPhaseSession(
		item,
		phaseNumber,
		phase,
		phaseLabel,
		phaseSession.claudeSessionId,
		spawnOptions,
	);
	/* why: abort the phase loop on a spawn failure rather than surfacing an
	 * uncaught rejection or retrying a launch that can't succeed */
	if (exitCode === HARNESS_SPAWN_FAILED) return { kind: "abort" };

	/* why: the phase Claude has exited, so its hooks no longer drive the daemon
	 * card; the driver now works (resolve result, reload plan, spawn the next
	 * phase) with no claude alive, leaving the card stuck on the last Stop's
	 * `waiting`. Push `running` explicitly so the card reflects the active driver
	 * work instead of the daemon guessing from PTY output (#447/#449). This only
	 * runs once a phase harness has exited — the review phase keeps its harness
	 * alive awaiting input, so awaitHarness blocks above and this never fires,
	 * leaving its `waiting` intact. */
	void setSessionStatus("running");

	return await resolvePhaseResult(phaseIndex, item.id);
}
