import MenuItem from "@mui/material/MenuItem";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { HighLevelReviewAction } from "../useHighLevelReviewAction";
import type { useReviewLaunch } from "../useReviewLaunch";

export function ReviewModeItems({
	review,
	highLevel,
	pick,
	capabilities,
	harness,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	highLevel?: HighLevelReviewAction | undefined;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
	capabilities: HarnessCapabilities;
	harness: HarnessKind;
}) {
	return reviewModeEntries(capabilities, undefined, harness).map((entry) => (
		<MenuItem
			key={entry.label}
			disabled={entry.disabled}
			onClick={(e) =>
				pick(
					e,
					highLevel && !entry.onHarness && entry.args.includes("--high-level")
						? highLevel.run
						: () => review.launchMode(entry.args),
				)
			}
		>
			{entry.label}
		</MenuItem>
	));
}
