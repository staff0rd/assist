import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import {
	SelectionCommentBody,
	type SelectionCommentBodyProps,
} from "../../App/SelectionCommentPopover/SelectionCommentBody";
import { PhoneSheetGrab } from "../PhoneSheetGrab";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";

const paperSx = { ...phoneSheetPaperSx, px: 2 } as const;
const bodySx = { display: "flex", flexDirection: "column", gap: 1.25 } as const;

export function PhoneCommentSheet({
	quote,
	...body
}: SelectionCommentBodyProps & { quote: string | undefined }) {
	const open = quote !== undefined;
	return (
		<Drawer
			anchor="bottom"
			open={open}
			onClose={body.onCancel}
			slotProps={{ paper: { sx: paperSx } }}
		>
			<PhoneSheetGrab />
			<Box sx={bodySx} data-testid="phone-comment-sheet">
				<SelectionCommentBody
					{...body}
					stacked
					quote={quote ?? ""}
					open={open}
				/>
			</Box>
		</Drawer>
	);
}
