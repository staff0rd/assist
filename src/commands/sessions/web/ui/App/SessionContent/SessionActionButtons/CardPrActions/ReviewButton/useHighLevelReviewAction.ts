import { useTheme } from "@mui/material/styles";
import type { PrSummary } from "../../../../../../prList";
import type { ReviewOptions } from "../../../../../../../../../shared/reviewOptionFlags";
import type { SessionInfo } from "../../../../../types";
import { useApiNode } from "../../../../../useApiNode";
import { useSessionLaunchContext } from "../../../../../useSessionLaunchContext";
import { sessionRegion } from "../../../../sessionRegion";
import { focusRegion } from "../../../../focusRegion";
import { pasteAndSubmit } from "../../../../../../../shared/pasteAndSubmit";
import { hasPendingHighLevelReview } from "./useHighLevelReviewAction/hasPendingHighLevelReview";
import { isHighLevelReviewSession } from "./useHighLevelReviewAction/isHighLevelReviewSession";
import { requestReopenHighLevelReview } from "./useHighLevelReviewAction/requestReopenHighLevelReview";

export type HighLevelReviewAction = {
	run: () => void;
	label?: string;
	caption?: string;
};

export function useHighLevelReviewAction(
	session: SessionInfo | undefined,
	pr: PrSummary,
	options: ReviewOptions,
	onError: (message: string) => void,
): HighLevelReviewAction | undefined {
	const { activateSession, sendInput } = useSessionLaunchContext();
	const ringColor = useTheme().palette.primary.main;
	const node = useApiNode();
	if (!session || !isHighLevelReviewSession(session, pr.number))
		return undefined;
	if (hasPendingHighLevelReview(session, pr.number))
		return {
			run: () => {
				activateSession(session.id);
				focusRegion(sessionRegion("preview", session.id), ringColor);
			},
		};
	if (options.force)
		return {
			run: () =>
				pasteAndSubmit(
					sendInput,
					session.id,
					`/review-high-level ${pr.number} --force`,
				),
		};
	return {
		label: "Reopen high-level review",
		caption: session.highLevelReviewHead
			? `Saved slices for ${session.highLevelReviewHead} · no re-slicing`
			: undefined,
		run: () =>
			void requestReopenHighLevelReview(session.id, pr.number, node).then(
				(failure) => failure && onError(failure),
			),
	};
}
