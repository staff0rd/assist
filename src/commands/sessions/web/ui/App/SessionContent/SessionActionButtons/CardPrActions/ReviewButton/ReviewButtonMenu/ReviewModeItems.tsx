import CircularProgress from "@mui/material/CircularProgress";
import { addressCommentsActions } from "../../../../../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../../../../../../parseHarnessCapabilities";
import { ReviewMenuRow } from "../../../../../ReviewMenuRow";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { HighLevelReviewAction } from "../useHighLevelReviewAction";
import type { useReviewLaunch } from "../useReviewLaunch";

export function ReviewModeItems({
	review,
	highLevel,
	pick,
	capabilities,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	highLevel?: HighLevelReviewAction | undefined;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
	capabilities: HarnessCapabilities;
}) {
	return reviewModeEntries(capabilities, reviewButtonModes, [
		...reviewButtonModes,
		...addressCommentsActions,
	]).map((entry) => {
		const reopen =
			highLevel?.label && entry.args.includes("--high-level")
				? highLevel
				: undefined;
		const label = reopen?.reopening
			? "Reopening high-level review…"
			: reopen?.label;
		return (
			<ReviewMenuRow
				key={entry.label}
				entry={label ? { ...entry, label, alternates: [] } : entry}
				caption={reopen?.reopening ? undefined : reopen?.caption}
				icon={
					reopen?.reopening ? (
						<CircularProgress size={12} color="inherit" />
					) : undefined
				}
				disabled={reopen?.reopening}
				onSelect={(e, args) =>
					pick(
						e,
						highLevel && args === entry.args && args.includes("--high-level")
							? highLevel.run
							: () => review.launchMode(args),
					)
				}
			/>
		);
	});
}
