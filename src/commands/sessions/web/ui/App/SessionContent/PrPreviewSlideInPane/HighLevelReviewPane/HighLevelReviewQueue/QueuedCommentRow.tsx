import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import type { PreviewReviewComment } from "../../../../../../../shared/PreviewDecision";
import { QueuedCommentEditor } from "./QueuedCommentEditor";
import { queuedCommentLocation } from "./queuedCommentLocation";

export function QueuedCommentRow({
	comment,
	onRemove,
	onEdit,
}: {
	comment: PreviewReviewComment;
	onRemove: () => void;
	onEdit: (note: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const location = queuedCommentLocation(comment);
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography variant="body2">
					<Box component="code" sx={{ fontSize: 12, mr: 1 }}>
						{location}
					</Box>
					{editing ? null : comment.note}
				</Typography>
				{editing && (
					<QueuedCommentEditor
						initial={comment.note}
						label={`Note for the queued comment on ${location}`}
						onSave={(note) => {
							onEdit(note);
							setEditing(false);
						}}
						onCancel={() => setEditing(false)}
					/>
				)}
			</Box>
			{!editing && (
				<IconButton
					size="small"
					aria-label={`Edit the queued comment on ${location}`}
					onClick={() => setEditing(true)}
					sx={{ p: 0.25 }}
				>
					<EditIcon sx={{ fontSize: 14 }} />
				</IconButton>
			)}
			<IconButton
				size="small"
				aria-label={`Remove the queued comment on ${location}`}
				onClick={onRemove}
				sx={{ p: 0.25 }}
			>
				<CloseIcon sx={{ fontSize: 14 }} />
			</IconButton>
		</Stack>
	);
}
