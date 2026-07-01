import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { ReviewSynthesisDialog } from "./ReviewSynthesisDialog";
import { StopClickPropagation } from "./StopClickPropagation";
import { useReviewSynthesis } from "./useReviewSynthesis";

export function ViewReviewButton({ cwd }: { cwd: string | undefined }) {
	const state = useReviewSynthesis(cwd, true);
	const [open, setOpen] = useState(false);

	if (state.status === "absent") return null;

	const loading = state.status === "loading";

	return (
		<StopClickPropagation>
			<Button
				size="small"
				disabled={loading}
				startIcon={
					loading ? (
						<CircularProgress size={14} />
					) : (
						<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />
					)
				}
				onClick={() => setOpen(true)}
				sx={{
					mt: 0.5,
					minWidth: 0,
					textTransform: "none",
					color: "text.secondary",
				}}
			>
				View review
			</Button>
			{open && (
				<ReviewSynthesisDialog state={state} onClose={() => setOpen(false)} />
			)}
		</StopClickPropagation>
	);
}
