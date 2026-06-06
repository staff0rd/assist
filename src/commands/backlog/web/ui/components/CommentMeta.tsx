import { Stack, Typography } from "@mui/material";
import type { BacklogComment } from "../types";

const metaRowSx = {
	alignItems: "center",
	fontSize: "0.75rem",
	color: "text.secondary",
	mb: 0.5,
} as const;

const idSx = { color: "text.disabled" } as const;

const labelSx = { fontWeight: 500 } as const;

const typeLabels: Record<BacklogComment["type"], string> = {
	summary: "Phase summary",
	comment: "Comment",
};

export function CommentMeta({ comment }: { comment: BacklogComment }) {
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
