import { AllClear } from "./NextGroups/AllClear";
import { NextIssueGroup } from "./NextGroups/NextIssueGroup";
import { NextPrGroup } from "./NextGroups/NextPrGroup";
import type { NextSectionsProps } from "./NextSectionsProps";

export function NextGroups({
	data,
	onStartPr,
	onStartIssue,
}: NextSectionsProps) {
	const { peerPrs, assignedIssues } = data;
	const allClear = [peerPrs, assignedIssues].every(
		(section) => section.items.length === 0 && !section.error,
	);
	if (allClear) return <AllClear />;
	const topPr = peerPrs.items[0];
	return (
		<>
			<NextPrGroup section={peerPrs} hidden={topPr} onStart={onStartPr} />
			<NextIssueGroup
				section={assignedIssues}
				hidden={topPr ? undefined : assignedIssues.items[0]}
				onStart={onStartIssue}
			/>
		</>
	);
}
