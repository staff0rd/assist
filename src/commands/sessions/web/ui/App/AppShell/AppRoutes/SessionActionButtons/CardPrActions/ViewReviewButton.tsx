import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { useState } from "react";
import { ActionButton } from "../../../ActionButton";
import { ReviewSynthesisDialog } from "./ViewReviewButton/ReviewSynthesisDialog";
import { sessionType } from "../../sessionType";
import { StopCardActivation } from "../../StopCardActivation";
import type { SessionInfo } from "../../../../../types";
import { useReviewSynthesis } from "./ViewReviewButton/useReviewSynthesis";

export function ViewReviewButton({ session }: { session: SessionInfo }) {
	const review = sessionType(session) === "review";
	const state = useReviewSynthesis(session.cwd, review);
	const [open, setOpen] = useState(false);

	if (state.status !== "ready") return null;

	return (
		<>
			<ActionButton
				label="Findings"
				title="View review findings"
				icon={<FactCheckOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setOpen(true);
				}}
			/>
			{open && (
				<StopCardActivation>
					<ReviewSynthesisDialog
						content={state.content}
						onClose={() => setOpen(false)}
					/>
				</StopCardActivation>
			)}
		</>
	);
}
