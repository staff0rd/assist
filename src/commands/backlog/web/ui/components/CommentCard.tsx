import { Paper, Stack, Typography } from "@mui/material";
import type { BacklogComment } from "../types";

const typeStyles: Record<
	BacklogComment["type"],
	{ bgcolor: string; borderColor: string }
> = {
	summary: { bgcolor: "warning.light", borderColor: "warning.dark" },
	comment: { bgcolor: "action.selected", borderColor: "divider" },
};

const typeLabels: Record<BacklogComment["type"], string> = {
	summary: "Phase summary",
	comment: "Comment",
};

function formatTimestamp(ts: string): string {
	const d = new Date(ts);
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const metaRowSx = {
	alignItems: "center",
	fontSize: "0.75rem",
	color: "text.secondary",
	mb: 0.5,
} as const;
const textSx = { color: "text.primary", whiteSpace: "pre-wrap" } as const;
const idSx = { color: "text.disabled" } as const;
const labelSx = { fontWeight: 500 } as const;

function cardSx(styles: { bgcolor: string; borderColor: string }) {
	return { p: 1.5, bgcolor: styles.bgcolor, borderColor: styles.borderColor };
}

function CommentMeta({ comment }: { comment: BacklogComment }) {
	return (
		<Stack direction="row" spacing={0.5} sx={metaRowSx}>
			{comment.id !== undefined && (
				<Typography variant="caption" sx={idSx}>
					#{comment.id}
				</Typography>
			)}
			<Typography variant="caption" sx={labelSx}>
				{typeLabels[comment.type]}
			</Typography>
			{comment.phase !== undefined && (
				<Typography variant="caption">· Phase {comment.phase}</Typography>
			)}
			<Typography variant="caption">
				· {formatTimestamp(comment.timestamp)}
			</Typography>
		</Stack>
	);
}

export function CommentCard({ comment }: { comment: BacklogComment }) {
	return (
		<Paper variant="outlined" sx={cardSx(typeStyles[comment.type])}>
			<CommentMeta comment={comment} />
			<Typography variant="body2" sx={textSx}>
				{comment.text}
			</Typography>
		</Paper>
	);
}
