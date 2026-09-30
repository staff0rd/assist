import type { NextIssue, NextSection } from "../../../../../../next/types";
import { NextGroup } from "./NextGroup";
import { NextIssueFacts } from "../NextIssueFacts";
import { NextRow } from "./NextRow";
import { nextChips } from "../nextChips";

export function NextIssueGroup({
	section,
	hidden,
	onStart,
}: {
	section: NextSection<NextIssue>;
	hidden?: NextIssue;
	onStart: (issue: NextIssue) => void;
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
						key={issue.number}
						number={issue.number}
						title={issue.title}
						facts={<NextIssueFacts issue={issue} />}
						url={issue.url}
						onStart={() => onStart(issue)}
					/>
				))}
		/>
	);
}
