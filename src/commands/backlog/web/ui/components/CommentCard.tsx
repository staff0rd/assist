import { Paper, Stack, Typography } from "@mui/material";
import type { BacklogComment } from "../types";
import { CommentMeta } from "./CommentMeta";
import { DeleteCommentAction } from "./DeleteCommentAction";

const typeStyles: Record<
	BacklogComment["type"],
	{ bgcolor: string; borderColor: string }
> = {
	summary: { bgcolor: "warning.light", borderColor: "warning.dark" },
	comment: { bgcolor: "action.selected", borderColor: "divider" },
};
const headerRowSx = {
	justifyContent: "space-between",
	alignItems: "flex-start",
} as const;
const textSx = { color: "text.primary", whiteSpace: "pre-wrap" } as const;

function cardSx(styles: { bgcolor: string; borderColor: string }) {
	return { p: 1.5, bgcolor: styles.bgcolor, borderColor: styles.borderColor };
}

export function CommentCard({
	comment,
	itemId,
	onDeleted,
}: {
	comment: BacklogComment;
	itemId?: number;
	onDeleted?: () => Promise<void>;
}) {
	return (
		<Paper variant="outlined" sx={cardSx(typeStyles[comment.type])}>
			<Stack direction="row" sx={headerRowSx}>
				<CommentMeta comment={comment} />
				{comment.id !== undefined && itemId !== undefined && onDeleted && (
					<DeleteCommentAction
						itemId={itemId}
						commentId={comment.id}
						onDeleted={onDeleted}
					/>
				)}
			</Stack>
			<Typography variant="body2" sx={textSx}>
				{comment.text}
			</Typography>
		</Paper>
	);
}
