import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { useState } from "react";
import type { PrSummary } from "../../../../../prList";
import type { SessionInfo } from "../../../../types";
import { ErrorSnackbar } from "../../../../ErrorSnackbar";
import { ActionButton } from "../../../ActionButton";
import { ReviewButtonMenu } from "./ReviewButton/ReviewButtonMenu";
import { useHighLevelReviewAction } from "./ReviewButton/useHighLevelReviewAction";
import { useReviewLaunch } from "./ReviewButton/useReviewLaunch";

export function ReviewButton({
	cwd,
	pr,
	session,
}: {
	cwd: string;
	pr: PrSummary;
	session?: SessionInfo;
}) {
	const review = useReviewLaunch(cwd, pr, session?.id);
	const [error, setError] = useState<string | null>(null);
	const highLevel = useHighLevelReviewAction(
		session,
		pr,
		review.options,
		setError,
	);
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
				highLevel={highLevel}
			/>
			<ErrorSnackbar error={error} onClose={() => setError(null)} />
		</>
	);
}
