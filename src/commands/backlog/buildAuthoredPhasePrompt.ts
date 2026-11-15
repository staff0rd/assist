import { formatItemId } from "./formatItemId";
import type { BacklogItem, PlanPhase } from "./types";
import { buildManualCheckLines } from "./buildManualCheckLines";
import { buildContextLines } from "./buildContextLines";

export function buildAuthoredPhasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	options: {
		commitBeforePhaseEnd: boolean;
		askCheck?: boolean;
		/** The phase runs in its own worktree alongside other phases and must land on the item branch. */
		land?: boolean;
	} = {
		commitBeforePhaseEnd: false,
	},
): string {
	const manualChecks = phase.manualChecks ?? [];
	const needsConfirmation = manualChecks.length > 0;
	const confirmSuffix = needsConfirmation ? " and the user confirms" : "";

	return [
		...buildContextLines(item, phaseNumber, phase),
		...buildStartedLines(item, phaseNumber),
		"",
		"Focus ONLY on this phase. Do not work on other phases.",
		"If you need to modify backlog items, run `assist backlog --help` to discover available commands.",
		"When you have completed all tasks for this phase, run /verify to check your work.",
		...buildManualCheckLines(
			manualChecks,
			options.commitBeforePhaseEnd,
			options.askCheck,
		),
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${formatItemId(item.id)} "<text>"\`.`,
		...(options.land ? buildLandLines(confirmSuffix) : []),
		"",
		`Once ${options.land ? "it has landed" : `verify passes${confirmSuffix}`}, run: assist backlog phase-done ${formatItemId(item.id)} ${phaseNumber} "<summary>"`,
		"Replace <summary> with a concise summary of what was done in this phase.",
	]
		.filter((line) => line !== undefined)
		.join("\n");
}

function buildLandLines(confirmSuffix: string): string[] {
	return [
		"",
		"This phase runs in its own worktree, in parallel with other phases of this item. It is only done once its commits have landed on the item branch.",
		`Once verify passes${confirmSuffix}, commit your work and run \`assist backlog land\`: it rebases onto the item branch, re-runs \`assist verify\` if the branch moved, and pushes your commits to it. If it stops on conflicts, resolve them (keeping the other phases' work), \`git rebase --continue\`, and run it again; if verify fails, fix it, commit, and run it again.`,
	];
}

function buildStartedLines(item: BacklogItem, phaseNumber: number): string[] {
	if (phaseNumber !== 1) return [];
	const command = item.jiraKey
		? `/jira started ${item.jiraKey}`
		: item.githubIssue
			? `/github started ${item.githubIssue}`
			: undefined;
	if (!command) return [];
	return [
		"",
		`As your first step, before any implementation, run \`${command}\` to assign the issue to yourself and transition it to In Progress.`,
	];
}
