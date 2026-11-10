import Divider from "@mui/material/Divider";
import { addressCommentsActions } from "../../../../../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../../../../../shared/reviewButtonModes";
import { useApiNode } from "../../../../../../useApiNode";
import { useHarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { ReviewHarnessPicker } from "../../../../../ReviewHarnessPicker";
import { ReviewOptionToggles } from "../../../../../ReviewOptionToggles";
import { useReviewHarness } from "../../../../../useReviewHarness";
import type { HighLevelReviewAction } from "../useHighLevelReviewAction";
import type { useReviewLaunch } from "../useReviewLaunch";
import { AddressCommentsItems } from "./AddressCommentsItems";
import { ReviewModeItems } from "./ReviewModeItems";

export function ReviewMenuContent({
	review,
	highLevel,
	pick,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	highLevel?: HighLevelReviewAction | undefined;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
}) {
	const capabilities = useHarnessCapabilities(useApiNode());
	const { choices, harness, setHarness } = useReviewHarness(capabilities, [
		...reviewButtonModes,
		...addressCommentsActions,
	]);
	return (
		<>
			<ReviewHarnessPicker
				choices={choices}
				value={harness}
				onChange={setHarness}
			/>
			<ReviewModeItems
				review={review}
				highLevel={highLevel}
				pick={pick}
				capabilities={capabilities}
				harness={harness}
			/>
			<Divider />
			<ReviewOptionToggles
				value={review.options}
				onChange={review.setOptions}
			/>
			<Divider />
			<AddressCommentsItems
				review={review}
				pick={pick}
				capabilities={capabilities}
				harness={harness}
			/>
		</>
	);
}
