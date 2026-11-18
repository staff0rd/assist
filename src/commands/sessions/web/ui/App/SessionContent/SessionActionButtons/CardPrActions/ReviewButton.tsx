import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import CircularProgress from "@mui/material/CircularProgress";
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
	const reopening = highLevel?.reopening === true;

	return (
		<>
			<ActionButton
				label={reopening ? "Reopening…" : "Review"}
				title={reopening ? "Reopening high-level review…" : "Review PR"}
				icon={
					reopening ? (
						<CircularProgress size={14} color="inherit" />
					) : (
						<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />
					)
				}
				disabled={reopening}
				onClick={(e) => {
					e.stopPropagation();
					if (reopening) return;
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
