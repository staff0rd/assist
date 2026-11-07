import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { QuoteBlock } from "../../../App/QuoteBlock";
import type { LocalComment } from "../../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrComments";
import { touchTarget } from "../../../designSystem/touchTarget";

const rowSx = {
	display: "flex",
	gap: 1,
	alignItems: "flex-start",
	py: 1.25,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const removeSx = {
	width: touchTarget,
	height: touchTarget,
	color: "text.secondary",
} as const;

export function PhoneReviewCommentRow({
	comment,
	color,
	onRemove,
}: {
	comment: LocalComment;
	color: string | undefined;
	onRemove: () => void;
}) {
	return (
		<Box sx={rowSx}>
			<Box
				sx={{
					flex: 1,
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					gap: 0.5,
				}}
			>
				<QuoteBlock
					text={comment.quote}
					sx={{ borderLeft: 2, borderColor: color, typography: "body2" }}
				/>
				<Typography variant="body1" sx={{ wordBreak: "break-word" }}>
					{comment.note}
				</Typography>
			</Box>
			<IconButton aria-label="Remove comment" onClick={onRemove} sx={removeSx}>
				<CloseIcon />
			</IconButton>
		</Box>
	);
}
