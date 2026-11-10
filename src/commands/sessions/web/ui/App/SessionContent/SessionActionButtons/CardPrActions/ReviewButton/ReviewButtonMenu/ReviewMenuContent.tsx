import Divider from "@mui/material/Divider";
import { useApiNode } from "../../../../../../useApiNode";
import { useHarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { ReviewOptionToggles } from "../../../../../ReviewOptionToggles";
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
	return (
		<>
			<ReviewModeItems
				review={review}
				highLevel={highLevel}
				pick={pick}
				capabilities={capabilities}
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
			/>
		</>
	);
}
