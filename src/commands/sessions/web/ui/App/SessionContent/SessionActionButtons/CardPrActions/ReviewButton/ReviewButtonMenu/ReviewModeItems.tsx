import MenuItem from "@mui/material/MenuItem";
import { useApiNode } from "../../../../../../useApiNode";
import { useHarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { HighLevelReviewAction } from "../useHighLevelReviewAction";
import type { useReviewLaunch } from "../useReviewLaunch";

export function ReviewModeItems({
	review,
	highLevel,
	pick,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	highLevel?: HighLevelReviewAction | undefined;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
}) {
	const capabilities = useHarnessCapabilities(useApiNode());
	return reviewModeEntries(capabilities).map((entry) => (
		<MenuItem
			key={entry.label}
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
