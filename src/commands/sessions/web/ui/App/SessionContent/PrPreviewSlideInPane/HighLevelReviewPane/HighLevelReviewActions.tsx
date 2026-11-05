import { Button, Stack, Typography } from "@mui/material";
import { HighLevelApproveButton } from "./HighLevelReviewActions/HighLevelApproveButton";
import { HighLevelNextSliceButton } from "./HighLevelReviewActions/HighLevelNextSliceButton";
import { highLevelReviewPrompt } from "./HighLevelReviewActions/highLevelReviewPrompt";
import { HighLevelStartFreshButton } from "./HighLevelReviewActions/HighLevelStartFreshButton";

export function HighLevelReviewActions({
	failed,
	outstanding,
	next,
	approveBlocker,
	onApprove,
	onComment,
	onRequestChanges,
	onClose,
	onRestart,
}: {
	failed: number;
	outstanding: number;
	next?: { onNext: () => void; disabled: boolean } | undefined;
	approveBlocker?: string | undefined;
	onApprove: () => void;
	onComment: () => void;
	onRequestChanges: () => void;
	onClose: () => void;
	onRestart: () => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{
				p: 2,
				alignItems: "center",
				justifyContent: "flex-end",
				flexWrap: "wrap",
				rowGap: 1,
			}}
		>
			<Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
				{approveBlocker ?? highLevelReviewPrompt(failed, outstanding)}
			</Typography>
			<HighLevelStartFreshButton
				sliced={next !== undefined}
				onRestart={onRestart}
			/>
			{next && <HighLevelNextSliceButton {...next} />}
			<Button variant="outlined" onClick={onClose}>
				Close
			</Button>
			<Button color="error" variant="outlined" onClick={onRequestChanges}>
				Request changes
			</Button>
			<Button variant="outlined" onClick={onComment}>
				Comment
			</Button>
			<HighLevelApproveButton blocker={approveBlocker} onApprove={onApprove} />
		</Stack>
	);
}
