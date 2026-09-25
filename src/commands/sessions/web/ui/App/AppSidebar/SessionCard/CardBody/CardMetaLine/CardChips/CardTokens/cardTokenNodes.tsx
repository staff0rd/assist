import { ItemTrackerLink } from "../../../../../../../../../../backlog/web/ui/components/ItemTrackerLink";
import type { ItemTracker } from "../../../../../../../../../../backlog/web/ui/types";
import { BacklogItemLink } from "./cardTokenNodes/BacklogItemLink";
import type { CardToken } from "./cardTokenNodes/CardToken";
import { PrNumberLink } from "./cardTokenNodes/PrNumberLink";
import { repoToken } from "./cardTokenNodes/repoToken";
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

	const targetPr = reviewTargetPr(session);
	if (targetPr !== undefined)
		tokens.push({
			key: "pr",
			node: <PrNumberLink session={session} prNumber={targetPr} />,
		});

	if (activity?.itemId != null)
		tokens.push({
			key: "item",
			node: <BacklogItemLink itemId={activity.itemId} cwd={session.cwd} />,
		});

	if (tracker)
		tokens.push({
			key: "tracker",
			node: <ItemTrackerLink tracker={tracker} variant="token" />,
		});

	return tokens;
}
