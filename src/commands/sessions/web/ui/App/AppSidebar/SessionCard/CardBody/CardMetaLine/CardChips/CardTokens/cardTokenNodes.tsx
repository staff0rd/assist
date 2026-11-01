import { activityItemIds } from "../../../../../../../../../../../shared/activityItemIds";
import { ItemTrackerLink } from "../../../../../../../../../../backlog/web/ui/components/ItemTrackerLink";
import type { ItemTracker } from "../../../../../../../../../../backlog/web/ui/types";
import { BacklogItemLink } from "./cardTokenNodes/BacklogItemLink";
import type { CardToken } from "./cardTokenNodes/CardToken";
import { PrNumberLink } from "./cardTokenNodes/PrNumberLink";
import { repoToken } from "./cardTokenNodes/repoToken";
import { promptIssueToken } from "./cardTokenNodes/promptIssueToken";
import { reviewTargetPr } from "../../../../../../reviewTargetPr";
import { sessionType } from "../../../../../../sessionType";
import type { SessionInfo } from "../../../../../../../types";

export function cardTokenNodes(
	session: SessionInfo,
	named: boolean,
	tracker?: ItemTracker,
): CardToken[] {
	const tokens: CardToken[] = [];
	const type = sessionType(session);
	const repo = named ? undefined : repoToken(session.cwd, type);
	const { activity } = session;

	if (repo) tokens.push(repo);

	if (activity?.kind === "backlog") {
		if (activity.phase !== activity.totalPhases)
			tokens.push({
				key: "phase",
				node: `${activity.phase}/${activity.totalPhases}`,
			});
	} else {
		tokens.push({ key: "type", node: type });
	}

	const targetPr = reviewTargetPr(session) ?? session.promptPr;
	if (targetPr !== undefined)
		tokens.push({
			key: "pr",
			badge: true,
			node: <PrNumberLink session={session} prNumber={targetPr} />,
		});

	for (const itemId of activityItemIds(activity))
		tokens.push({
			key: `item-${itemId}`,
			badge: true,
			node: <BacklogItemLink itemId={itemId} session={session} />,
		});

	if (tracker)
		tokens.push({
			key: "tracker",
			node: <ItemTrackerLink tracker={tracker} variant="token" />,
		});

	const issue = promptIssueToken(session.promptIssue, tracker);
	if (issue) tokens.push(issue);

	return tokens;
}
