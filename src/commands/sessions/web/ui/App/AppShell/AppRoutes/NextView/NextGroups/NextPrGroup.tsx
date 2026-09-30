import type { NextPr, NextSection } from "../../../../../../next/types";
import { NextGroup } from "./NextGroup";
import { NextPrFacts } from "../NextPrFacts";
import { NextRow } from "./NextRow";
import { nextChips } from "../nextChips";

export function NextPrGroup({
	section,
	hidden,
	onStart,
}: {
	section: NextSection<NextPr>;
	hidden?: NextPr;
	onStart: (pr: NextPr) => void;
}) {
	return (
		<NextGroup
			chip={nextChips.review}
			title="Peer PRs awaiting your review"
			count={section.items.length}
			error={section.error}
			rows={section.items
				.filter((pr) => pr !== hidden)
				.map((pr) => (
					<NextRow
						key={pr.number}
						number={pr.number}
						title={pr.title}
						facts={<NextPrFacts pr={pr} />}
						url={pr.url}
						onStart={() => onStart(pr)}
					/>
				))}
		/>
	);
}
