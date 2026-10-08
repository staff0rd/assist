import type { ReactNode } from "react";
import type { nextTopItem } from "../../../../../../next/nextTopItem";
import { NextIssueFacts } from "../NextIssueFacts";
import { NextPrFacts } from "../NextPrFacts";
import { type NextChip, nextChips } from "../nextChips";
import type { NextSectionsProps } from "../NextSectionsProps";
import { nextIssueWhy } from "./nextHeroDetails/nextIssueWhy";
import { nextMineHeroDetails } from "./nextHeroDetails/nextMineHeroDetails";
import { nextPickupHeroDetails } from "./nextHeroDetails/nextPickupHeroDetails";
import { nextPrWhy } from "./nextHeroDetails/nextPrWhy";

type HeroDetails = {
	chip: NextChip;
	facts: ReactNode;
	why: string;
	onStart: (cwd: string) => void;
};

export function nextHeroDetails(
	top: NonNullable<ReturnType<typeof nextTopItem>>,
	props: NextSectionsProps,
): HeroDetails {
	const { data, onStartPr, onStartIssue } = props;
	const { peerPrs, assignedIssues } = data;
	switch (top.kind) {
		case "pr":
			return {
				chip: nextChips.review,
				facts: <NextPrFacts pr={top.item} />,
				why: nextPrWhy(top.item, peerPrs.items.length),
				onStart: (cwd) => onStartPr(top.item, cwd),
			};
		case "issue":
			return {
				chip: nextChips.assigned,
				facts: <NextIssueFacts issue={top.item} />,
				why: nextIssueWhy(
					top.item,
					assignedIssues.items.length,
					!peerPrs.error,
				),
				onStart: (cwd) => onStartIssue(top.item, cwd),
			};
		case "pickup":
			return nextPickupHeroDetails(top.item, props);
		case "mine":
			return nextMineHeroDetails(top.item, props);
	}
}
