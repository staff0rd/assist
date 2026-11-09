import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import { ReviewOptionToggles } from "../../../../ReviewOptionToggles";
import { AddressCommentsItems } from "./ReviewButtonMenu/AddressCommentsItems";
import { ReviewModeItems } from "./ReviewButtonMenu/ReviewModeItems";
import type { HighLevelReviewAction } from "./useHighLevelReviewAction";
import type { useReviewLaunch } from "./useReviewLaunch";

export function ReviewButtonMenu({
	anchorEl,
	onClose,
	review,
	highLevel,
}: {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	review: ReturnType<typeof useReviewLaunch>;
	highLevel?: HighLevelReviewAction | undefined;
}) {
	const pick = (e: { stopPropagation: () => void }, run: () => void) => {
		e.stopPropagation();
		onClose();
		run();
	};

	return (
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			onClick={(e) => e.stopPropagation()}
		>
			<ReviewModeItems review={review} highLevel={highLevel} pick={pick} />
			<Divider />
			<ReviewOptionToggles
				value={review.options}
				onChange={review.setOptions}
			/>
			<Divider />
			<AddressCommentsItems review={review} pick={pick} />
		</Menu>
	);
}
