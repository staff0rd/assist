import type { BacklogItem } from "./types";

export function buildJiraStartedLines(
	item: BacklogItem,
	phaseNumber: number,
): string[] {
	if (phaseNumber !== 1 || !item.jiraKey) {
		return [];
	}
	return [
		"",
		`As your first step, before any implementation, run \`/jira started ${item.jiraKey}\` to assign the issue to yourself and transition it to In Progress.`,
	];
}
