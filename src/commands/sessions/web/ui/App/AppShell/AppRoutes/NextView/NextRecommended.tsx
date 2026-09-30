import type {
	NextIssue,
	NextPr,
	NextResponse,
} from "../../../../../next/types";
import { NextIssueFacts } from "./NextIssueFacts";
import { NextPrFacts } from "./NextPrFacts";
import { nextChips } from "./nextChips";
import { NextHero } from "./NextRecommended/NextHero";
import { nextIssueWhy } from "./NextRecommended/nextIssueWhy";
import { nextPrWhy } from "./NextRecommended/nextPrWhy";

export function NextRecommended({
	data,
	onStartPr,
	onStartIssue,
}: {
	data: NextResponse;
	onStartPr: (pr: NextPr) => void;
	onStartIssue: (issue: NextIssue) => void;
}) {
	const { peerPrs, assignedIssues } = data;
	const pr = peerPrs.items[0];
	if (pr)
		return (
			<NextHero
				chip={nextChips.review}
				number={pr.number}
				title={pr.title}
				facts={<NextPrFacts pr={pr} />}
				why={nextPrWhy(pr, peerPrs.items.length)}
				url={pr.url}
				onStart={() => onStartPr(pr)}
			/>
		);
	const issue = assignedIssues.items[0];
	if (!issue) return null;
	return (
		<NextHero
			chip={nextChips.assigned}
			number={issue.number}
			title={issue.title}
			facts={<NextIssueFacts issue={issue} />}
			why={nextIssueWhy(issue, assignedIssues.items.length, !peerPrs.error)}
			url={issue.url}
			onStart={() => onStartIssue(issue)}
		/>
	);
}
