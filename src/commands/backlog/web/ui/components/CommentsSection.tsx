import { Box, Stack, Typography } from "@mui/material";
import type { BacklogComment } from "../types";
import { CommentCard } from "./CommentCard";

const headingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function CommentsSection({ comments }: { comments: BacklogComment[] }) {
	if (comments.length === 0) return null;
	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="overline" sx={headingSx}>
				Comments
			</Typography>
			<Stack spacing={1}>
				{comments.map((c, i) => (
					<CommentCard key={`${c.timestamp}-${i}`} comment={c} />
				))}
			</Stack>
		</Box>
	);
}
