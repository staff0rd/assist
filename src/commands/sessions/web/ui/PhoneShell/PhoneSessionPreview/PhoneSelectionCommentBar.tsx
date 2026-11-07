import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { PointerEvent } from "react";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";

const barSx = {
	position: "fixed",
	left: 0,
	right: 0,
	bottom: 0,
	zIndex: (t: { zIndex: { modal: number } }) => t.zIndex.modal + 1,
	px: 2,
	pt: 1.5,
	pb: `calc(${safeAreaInsets.bottom} + 16px)`,
	bgcolor: "background.paper",
	borderTop: 1,
	borderColor: "divider",
} as const;

export function PhoneSelectionCommentBar({
	open,
	onComment,
}: {
	open: boolean;
	onComment: () => void;
}) {
	if (!open) return null;
	const commentBeforeTapClearsSelection = (event: PointerEvent) => {
		event.preventDefault();
		onComment();
	};
	return (
		<Box sx={barSx}>
			<Button
				fullWidth
				variant="contained"
				disableElevation
				onPointerDown={commentBeforeTapClearsSelection}
				onClick={onComment}
			>
				Comment on selection
			</Button>
		</Box>
	);
}
