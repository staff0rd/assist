import { nextTopItem } from "../../../../../next/nextTopItem";
import { nextChips } from "./nextChips";
import { AllClear } from "./NextGroups/AllClear";
import { isAllClear } from "./NextGroups/isAllClear";
import { NextGroup } from "./NextGroups/NextGroup";
import { NextPrGroup } from "./NextGroups/NextPrGroup";
import { nextIssueRows } from "./NextGroups/nextIssueRows";
import type { NextSectionsProps } from "./NextSectionsProps";
import { useNextSessions } from "./useNextSessions";

export function NextGroups({
	data,
	onStartPr,
	onStartIssue,
	onStartPickup,
}: NextSectionsProps) {
	const nextSessions = useNextSessions();
	const { peerPrs, myPrs, assignedIssues, pickups } = data;
	if (isAllClear(data)) return <AllClear />;
	const hiddenUrl = nextTopItem(data)?.item.url;
	return (
		<>
			<NextPrGroup
				chip={nextChips.review}
				title="Peer PRs awaiting your review"
				section={peerPrs}
				hiddenUrl={hiddenUrl}
				onStart={onStartPr}
			/>
			<NextPrGroup
				chip={nextChips.mine}
				title="Your open PRs"
				section={myPrs}
				hiddenUrl={hiddenUrl}
				onStart={onStartPr}
			/>
			<NextGroup
				chip={nextChips.assigned}
				title="Issues assigned to you"
				count={assignedIssues.items.length}
				error={assignedIssues.error}
				rows={nextIssueRows(
					assignedIssues.items,
					hiddenUrl,
					onStartIssue,
					nextSessions,
				)}
			/>
			<NextGroup
				chip={nextChips.pickup}
				title="Project items to pick up"
				count={pickups.items.length}
				error={pickups.error}
				rows={nextIssueRows(
					pickups.items,
					hiddenUrl,
					onStartPickup,
					nextSessions,
				)}
			/>
		</>
	);
}
