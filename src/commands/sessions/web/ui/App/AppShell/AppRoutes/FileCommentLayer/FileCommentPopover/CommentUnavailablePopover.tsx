import { Popover, Typography } from "@mui/material";
import type { SelectionAnchor } from "../../SelectionCommentPopover";

const textSx = { p: 1.5, width: 280 } as const;

export function CommentUnavailablePopover({
	pending,
	message,
	onClose,
}: {
	pending: SelectionAnchor | null;
	message: string;
	onClose: () => void;
}) {
	return (
		<Popover
			open={pending !== null}
			onClose={onClose}
			anchorReference="anchorPosition"
			anchorPosition={
				pending ? { top: pending.top, left: pending.left } : undefined
			}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
		>
			<Typography variant="body2" color="text.secondary" sx={textSx}>
				{message}
			</Typography>
		</Popover>
	);
}
