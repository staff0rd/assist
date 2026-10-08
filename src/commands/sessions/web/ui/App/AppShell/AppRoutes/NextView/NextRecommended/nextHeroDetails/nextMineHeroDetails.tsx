import type { NextPr } from "../../../../../../../next/types";
import { NextPrFacts } from "../../NextPrFacts";
import { nextChips } from "../../nextChips";
import type { NextSectionsProps } from "../../NextSectionsProps";
import { nextMinePrWhy } from "./nextMineHeroDetails/nextMinePrWhy";

export function nextMineHeroDetails(
	pr: NextPr,
	{ data, onStartPr }: NextSectionsProps,
) {
	const { peerPrs, myPrs, assignedIssues, pickups } = data;
	return {
		chip: nextChips.mine,
		facts: <NextPrFacts pr={pr} />,
		why: nextMinePrWhy(
			pr,
			myPrs.items.length,
			!peerPrs.error && !assignedIssues.error && !pickups.error,
		),
		onStart: (cwd: string) => onStartPr(pr, cwd),
	};
}
