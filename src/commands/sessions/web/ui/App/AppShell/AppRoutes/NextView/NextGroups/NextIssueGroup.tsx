import type { NextIssue, NextSection } from "../../../../../../next/types";
import { NextIssueFacts } from "../NextIssueFacts";
import { nextChips } from "../nextChips";
import { NextGroup } from "./NextGroup";
import { NextRow } from "./NextRow";

export function NextIssueGroup({
	section,
	hidden,
	onStart,
}: {
	section: NextSection<NextIssue>;
	hidden?: NextIssue;
	onStart: (issue: NextIssue, cwd: string) => void;
}) {
	return (
		<NextGroup
			chip={nextChips.assigned}
			title="Issues assigned to you"
			count={section.items.length}
			error={section.error}
			rows={section.items
				.filter((issue) => issue !== hidden)
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
				))}
		/>
	);
}
