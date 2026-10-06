import type { NextIssue, NextPickup } from "../../../../../../next/types";
import { matchIssueSessions } from "../matchIssueSessions";
import { NextIssueFacts } from "../NextIssueFacts";
import type { NextSessions } from "../useNextSessions";
import { NextRow } from "./NextRow";

export function nextIssueRows<T extends NextIssue | NextPickup>(
	items: T[],
	hiddenUrl: string | undefined,
	onStart: (issue: T, cwd: string) => void,
	{ sessions, trackedIssues }: NextSessions,
) {
	return items
		.filter((issue) => issue.url !== hiddenUrl)
		.map((issue) => (
			<NextRow
				key={issue.url}
				repo={issue.repo}
				number={issue.number}
				title={issue.title}
				facts={<NextIssueFacts issue={issue} />}
				url={issue.url}
				onStart={(cwd) => onStart(issue, cwd)}
				sessions={matchIssueSessions(
					sessions,
					trackedIssues,
					issue.repo,
					issue.number,
				)}
			/>
		));
}
