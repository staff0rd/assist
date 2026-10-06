import { nextTopItem } from "../../../../../next/nextTopItem";
import { nextChips } from "./nextChips";
import { AllClear } from "./NextGroups/AllClear";
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
	const { peerPrs, assignedIssues, pickups } = data;
	const allClear = [peerPrs, assignedIssues, pickups].every(
		(section) => section.items.length === 0 && !section.error,
	);
	if (allClear) return <AllClear />;
	const hiddenUrl = nextTopItem(data)?.item.url;
	return (
		<>
			<NextPrGroup
				section={peerPrs}
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
