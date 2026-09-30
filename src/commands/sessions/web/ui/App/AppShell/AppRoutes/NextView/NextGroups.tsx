import type {
	NextIssue,
	NextPr,
	NextResponse,
} from "../../../../../next/types";
import { AllClear } from "./NextGroups/AllClear";
import { NextIssueGroup } from "./NextGroups/NextIssueGroup";
import { NextPrGroup } from "./NextGroups/NextPrGroup";

export function NextGroups({
	data,
	onStartPr,
	onStartIssue,
}: {
	data: NextResponse;
	onStartPr: (pr: NextPr) => void;
	onStartIssue: (issue: NextIssue) => void;
}) {
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
