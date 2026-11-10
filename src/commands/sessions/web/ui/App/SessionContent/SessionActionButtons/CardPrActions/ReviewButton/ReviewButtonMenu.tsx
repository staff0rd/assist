import Menu from "@mui/material/Menu";
import { ReviewMenuContent } from "./ReviewButtonMenu/ReviewMenuContent";
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
			<ReviewMenuContent review={review} highLevel={highLevel} pick={pick} />
		</Menu>
	);
}
