import chalk from "chalk";
import { REVIEW_PHASE_NAME } from "../buildPhasePrompt";
import type { BacklogItem, PhaseSession, PlanPhase } from "../types";
import { printPhaseTasks } from "./printPhaseTasks";

function phaseHeader(index: number, name: string, isCurrent: boolean): string {
	const phaseNumber = index + 1;
	const marker = isCurrent ? chalk.green("▶ ") : "  ";
	const label = isCurrent
		? chalk.green.bold(`Phase ${phaseNumber}: ${name}`)
		: `${chalk.bold(`Phase ${phaseNumber}:`)} ${name}`;
	return `${marker}${label}`;
}

function printPhaseSessions(sessions: PhaseSession[]): void {
	if (sessions.length === 0) return;
	console.log(`      ${chalk.dim("Sessions:")}`);
	for (const s of sessions) {
		console.log(
			`        ${chalk.dim(`- ${s.hostname} / ${s.osUser} / ${s.claudeSessionId}`)}`,
		);
	}
}

function printPhase(
	phase: PlanPhase,
	index: number,
	isCurrent: boolean,
	sessions: PhaseSession[],
): void {
	console.log(phaseHeader(index, phase.name, isCurrent));
	printPhaseTasks(phase);
	printPhaseSessions(sessions);
}

function printReviewSessions(item: BacklogItem, planLength: number): void {
	const sessions = (item.phaseSessions ?? []).filter(
		(s) => s.phaseIdx >= planLength,
	);
	if (sessions.length === 0) return;
	const isCurrent = item.currentPhase === planLength + 1;
	console.log(phaseHeader(planLength, REVIEW_PHASE_NAME, isCurrent));
	printPhaseSessions(sessions);
}

export function printPlan(item: BacklogItem): void {
	if (!item.plan || item.plan.length === 0) return;

	console.log(chalk.bold("Plan"));
	for (const [i, phase] of item.plan.entries()) {
		const isCurrent = item.currentPhase === i + 1;
		const sessions = (item.phaseSessions ?? []).filter((s) => s.phaseIdx === i);
		printPhase(phase, i, isCurrent, sessions);
	}
	printReviewSessions(item, item.plan.length);
	console.log();
}
