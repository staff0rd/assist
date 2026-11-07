import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import type { ComponentProps } from "react";
import type { LocalComment } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrComments";
import { PhonePreviewDecisions } from "../PhonePreviewDecisions";
import { PhoneSheetGrab } from "../PhoneSheetGrab";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";
import { PhoneReviewCommentRow } from "./PhoneReviewCommentList/PhoneReviewCommentRow";

const paperSx = {
	...phoneSheetPaperSx,
	px: 2,
	display: "flex",
	flexDirection: "column",
	gap: 1.25,
} as const;

const headingSx = {
	typography: "caption",
	fontWeight: 600,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	color: "text.secondary",
} as const;

export function PhoneReviewCommentList({
	open,
	comments,
	colors,
	onClose,
	onRemove,
	decisions,
}: {
	open: boolean;
	comments: LocalComment[];
	colors: string[];
	onClose: () => void;
	onRemove: (id: number) => void;
	decisions: ComponentProps<typeof PhonePreviewDecisions>;
}) {
	return (
		<Drawer
			anchor="bottom"
			open={open && comments.length > 0}
			onClose={onClose}
			slotProps={{ paper: { sx: paperSx } }}
		>
			<PhoneSheetGrab />
			<Box data-testid="phone-review-comments" sx={{ display: "contents" }}>
				<Box sx={headingSx}>Review comments ({comments.length})</Box>
				<Box>
					{comments.map((c, i) => (
						<PhoneReviewCommentRow
							key={c.id}
							comment={c}
							color={colors[i]}
							onRemove={() => onRemove(c.id)}
						/>
					))}
				</Box>
				<Typography variant="caption" color="text.secondary">
					Sent with Approve or Reject
				</Typography>
				<PhonePreviewDecisions {...decisions} />
			</Box>
		</Drawer>
	);
}
