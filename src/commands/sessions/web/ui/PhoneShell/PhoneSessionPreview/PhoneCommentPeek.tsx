import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { CopyableQuote } from "../../App/SelectionCommentPopover/SelectionCommentBody/CopyableQuote";
import type { LocalComment } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrComments";
import { PhoneSheetGrab } from "../PhoneSheetGrab";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";

const paperSx = { ...phoneSheetPaperSx, px: 2 } as const;
const bodySx = { display: "flex", flexDirection: "column", gap: 1.5 } as const;

export function PhoneCommentPeek({
	comment,
	onClose,
	onEdit,
	onDelete,
}: {
	comment: LocalComment | null;
	onClose: () => void;
	onEdit: (comment: LocalComment) => void;
	onDelete: (comment: LocalComment) => void;
}) {
	return (
		<Drawer
			anchor="bottom"
			open={comment !== null}
			onClose={onClose}
			slotProps={{ paper: { sx: paperSx } }}
		>
			<PhoneSheetGrab />
			{comment && (
				<Box sx={bodySx} data-testid="phone-comment-peek">
					<CopyableQuote text={comment.quote} />
					<Typography variant="body1">{comment.note}</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button
							variant="outlined"
							color="error"
							sx={{ flex: 1 }}
							onClick={() => onDelete(comment)}
						>
							Delete
						</Button>
						<Button
							variant="tonal"
							sx={{ flex: 1 }}
							onClick={() => onEdit(comment)}
						>
							Edit
						</Button>
					</Box>
				</Box>
			)}
		</Drawer>
	);
}
