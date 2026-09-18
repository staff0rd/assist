import { assertProjectScope } from "./assertProjectScope";
import { fetchIssueProjectItems } from "./fetchIssueProjectItems";
import type { IssueProjectItem } from "./toIssueProjectItem";
import { setProjectItemStatus } from "./setProjectItemStatus";

const IN_PROGRESS = "in progress";

function boardName(item: IssueProjectItem): string {
	return `project ${item.projectNumber} (${item.projectTitle})`;
}

function moveItem(item: IssueProjectItem): void {
	const statusField = item.statusField;
	if (!statusField) {
		console.log(`${boardName(item)} has no Status field, so it was not moved`);
		return;
	}
	const option = statusField.options.find(
		(candidate) => candidate.name.toLowerCase() === IN_PROGRESS,
	);
	if (!option) {
		const names = statusField.options.map((candidate) => candidate.name);
		console.log(
			`The Status field on ${boardName(item)} has no In Progress option, so it was not moved. It offers ${names.join(", ") || "no options"}`,
		);
		return;
	}
	setProjectItemStatus({
		projectId: item.projectId,
		itemId: item.itemId,
		fieldId: statusField.id,
		optionId: option.id,
	});
	console.log(`Set ${boardName(item)} to ${option.name}`);
}

export function moveIssueToInProgress(target: {
	owner: string;
	repo: string;
	number: number;
}): void {
	try {
		assertProjectScope();
	} catch (error) {
		console.log(error instanceof Error ? error.message : String(error));
		return;
	}

	const { items } = fetchIssueProjectItems(target);
	if (items.length === 0) {
		console.log(
			`${target.owner}/${target.repo}#${target.number} is on no project board, so there was nothing to move`,
		);
		return;
	}
	for (const item of items) moveItem(item);
}
