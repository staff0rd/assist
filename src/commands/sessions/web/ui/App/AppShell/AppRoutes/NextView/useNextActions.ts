import { useState } from "react";
import type { NextReview } from "./NextReviewDialog";
import type { NextSectionsProps } from "./NextSectionsProps";
import { useStartIssue } from "./useStartIssue";
import { useStartPickup } from "./useStartPickup";

export function useNextActions(selectedCwd: string, refresh: () => void) {
	const [reviewing, setReviewing] = useState<NextReview | null>(null);
	const startIssue = useStartIssue();
	const { start: startPickup, ...pickup } = useStartPickup(
		selectedCwd,
		startIssue,
		refresh,
	);
	const actions: Omit<NextSectionsProps, "data"> = {
		onStartPr: (pr, cwd) => setReviewing({ pr, cwd }),
		onStartIssue: startIssue,
		onStartPickup: (item, cwd) => !pickup.picking && startPickup(item, cwd),
	};
	return {
		actions,
		pickup,
		reviewing,
		closeReview: () => setReviewing(null),
	};
}
