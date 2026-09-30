import type { NextPr, NextSection } from "../../../../../../next/types";
import { NextPrFacts } from "../NextPrFacts";
import { nextChips } from "../nextChips";
import { NextGroup } from "./NextGroup";
import { NextRow } from "./NextRow";

export function NextPrGroup({
	section,
	hiddenUrl,
	onStart,
}: {
	section: NextSection<NextPr>;
	hiddenUrl?: string;
	onStart: (pr: NextPr, cwd: string) => void;
}) {
	return (
		<NextGroup
			chip={nextChips.review}
			title="Peer PRs awaiting your review"
			count={section.items.length}
			error={section.error}
			rows={section.items
				.filter((pr) => pr.url !== hiddenUrl)
				.map((pr) => (
					<NextRow
						key={pr.url}
						repo={pr.repo}
						number={pr.number}
						title={pr.title}
						facts={<NextPrFacts pr={pr} />}
						url={pr.url}
						onStart={(cwd) => onStart(pr, cwd)}
					/>
				))}
		/>
	);
}
