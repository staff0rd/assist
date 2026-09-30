import { assertProjectScope } from "../../../github/issue/assertProjectScope";
import { assignIssueToSelf } from "../../../github/issue/assignIssueToSelf";
import { fetchProjectV2 } from "../../../github/issue/fetchProjectV2";
import { setProjectItemStatus } from "../../../github/issue/setProjectItemStatus";

export type PickupTarget = {
	project: string;
	repo: string;
	number: number;
	itemId: string;
};

const IN_PROGRESS = "in progress";

export function pickUpItem(target: PickupTarget): void {
	assertProjectScope();
	const [owner, number] = target.project.split("/");
	const board = fetchProjectV2(owner, Number(number));
	const option = board.statusField?.options.find(
		(candidate) => candidate.name.toLowerCase() === IN_PROGRESS,
	);
	if (!board.statusField || !option)
		throw new Error(
			`Project ${target.project} (${board.title}) has no In Progress status to move ${target.repo}#${target.number} to`,
		);
	assignIssueToSelf(target.number, target.repo);
	setProjectItemStatus({
		projectId: board.id,
		itemId: target.itemId,
		fieldId: board.statusField.id,
		optionId: option.id,
	});
}
