import { NextIssueFacts } from "./NextIssueFacts";
import { NextPrFacts } from "./NextPrFacts";
import { nextChips } from "./nextChips";
import { NextHero } from "./NextRecommended/NextHero";
import { nextIssueWhy } from "./NextRecommended/nextIssueWhy";
import { nextPrWhy } from "./NextRecommended/nextPrWhy";
import type { NextSectionsProps } from "./NextSectionsProps";

export function NextRecommended({
	data,
	onStartPr,
	onStartIssue,
}: NextSectionsProps) {
	const { peerPrs, assignedIssues } = data;
	const pr = peerPrs.items[0];
	if (pr)
		return (
			<NextHero
				chip={nextChips.review}
				repo={pr.repo}
				number={pr.number}
				title={pr.title}
				facts={<NextPrFacts pr={pr} />}
				why={nextPrWhy(pr, peerPrs.items.length)}
				url={pr.url}
				onStart={(cwd) => onStartPr(pr, cwd)}
			/>
		);
	const issue = assignedIssues.items[0];
	if (!issue) return null;
	return (
		<NextHero
			chip={nextChips.assigned}
			repo={issue.repo}
			number={issue.number}
			title={issue.title}
			facts={<NextIssueFacts issue={issue} />}
			why={nextIssueWhy(issue, assignedIssues.items.length, !peerPrs.error)}
			url={issue.url}
			onStart={(cwd) => onStartIssue(issue, cwd)}
		/>
	);
}
