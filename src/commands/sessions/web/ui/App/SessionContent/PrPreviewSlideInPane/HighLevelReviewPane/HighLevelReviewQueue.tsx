import { Box, Typography } from "@mui/material";
import type { PreviewReviewComment } from "../../../../../../shared/PreviewDecision";
import { QueuedCommentRow } from "./HighLevelReviewQueue/QueuedCommentRow";
import { queuedCommentLocation } from "./HighLevelReviewQueue/queuedCommentLocation";

export function HighLevelReviewQueue({
	queued,
	onRemove,
	onEdit,
}: {
	queued: PreviewReviewComment[];
	onRemove: (index: number) => void;
	onEdit: (index: number, note: string) => void;
}) {
	if (queued.length === 0) return null;
	return (
		<Box
			component="section"
			aria-label="Queued review comments"
			sx={{ px: 2, py: 1, maxHeight: 160, overflowY: "auto" }}
		>
			<Typography
				variant="overline"
				sx={{ color: "text.secondary", letterSpacing: 1 }}
			>
				{`Queued for review (${queued.length})`}
			</Typography>
			{queued.map((comment, index) => (
				<QueuedCommentRow
					key={`${queuedCommentLocation(comment)}:${index}`}
					comment={comment}
					onRemove={() => onRemove(index)}
					onEdit={(note) => onEdit(index, note)}
				/>
			))}
		</Box>
	);
}
