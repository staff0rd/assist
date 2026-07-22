import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { QuoteBlock } from "./QuoteBlock";
import type { LocalComment } from "./usePrComments";

export function PrCommentList({
	comments,
	colors,
	onRemove,
}: {
	comments: LocalComment[];
	colors: string[];
	onRemove: (id: number) => void;
}) {
	if (comments.length === 0) return null;
	return (
		<>
			<Divider />
			<Box sx={{ maxHeight: 200, overflow: "auto", px: 2, py: 1 }}>
				<Typography variant="overline" color="text.secondary">
					Comments ({comments.length})
				</Typography>
				<Stack spacing={1}>
					{comments.map((c, i) => (
						<Box
							key={c.id}
							sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
						>
							<Box
								sx={{
									width: 4,
									alignSelf: "stretch",
									borderRadius: 2,
									flexShrink: 0,
								}}
								style={{ backgroundColor: colors[i] }}
							/>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<QuoteBlock text={c.quote} />
								<Typography
									variant="body2"
									sx={{ mt: 0.5, wordBreak: "break-word" }}
								>
									{c.note}
								</Typography>
							</Box>
							<IconButton
								size="small"
								aria-label="Remove comment"
								onClick={() => onRemove(c.id)}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					))}
				</Stack>
			</Box>
		</>
	);
}
