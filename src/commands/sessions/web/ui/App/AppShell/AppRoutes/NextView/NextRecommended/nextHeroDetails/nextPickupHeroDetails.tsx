import type { NextPickup } from "../../../../../../../next/types";
import { NextIssueFacts } from "../../NextIssueFacts";
import { nextChips } from "../../nextChips";
import type { NextSectionsProps } from "../../NextSectionsProps";
import { nextPickupWhy } from "./nextPickupHeroDetails/nextPickupWhy";

export function nextPickupHeroDetails(
	pickup: NextPickup,
	{ data, onStartPickup }: NextSectionsProps,
) {
	const { peerPrs, assignedIssues, pickups } = data;
	return {
		chip: nextChips.pickup,
		facts: <NextIssueFacts issue={pickup} />,
		why: nextPickupWhy(
			pickup,
			pickups.items.length,
			!peerPrs.error && !assignedIssues.error,
		),
		onStart: (cwd: string) => onStartPickup(pickup, cwd),
	};
}
