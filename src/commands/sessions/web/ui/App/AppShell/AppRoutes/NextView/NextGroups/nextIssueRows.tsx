import type { NextIssue, NextPickup } from "../../../../../../next/types";
import { NextIssueFacts } from "../NextIssueFacts";
import { NextRow } from "./NextRow";

export function nextIssueRows<T extends NextIssue | NextPickup>(
	items: T[],
	hiddenUrl: string | undefined,
	onStart: (issue: T, cwd: string) => void,
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
			/>
		));
}
