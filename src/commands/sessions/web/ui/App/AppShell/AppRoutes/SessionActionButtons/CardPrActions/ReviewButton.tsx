import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { useState } from "react";
import type { PrSummary } from "../../../../../../prList";
import { ActionButton } from "../../../ActionButton";
import { ReviewButtonMenu } from "./ReviewButton/ReviewButtonMenu";
import { useReviewLaunch } from "./ReviewButton/useReviewLaunch";

export function ReviewButton({
	cwd,
	pr,
	launchedFrom,
}: {
	cwd: string;
	pr: PrSummary;
	launchedFrom?: string;
}) {
	const review = useReviewLaunch(cwd, pr, launchedFrom);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	return (
		<>
			<ActionButton
				label="Review"
				title="Review PR"
				icon={<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					review.resetOptions();
					setAnchorEl(e.currentTarget);
				}}
			/>
			<ReviewButtonMenu
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				review={review}
			/>
		</>
	);
}
