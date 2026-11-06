import Button from "@mui/material/Button";
import type { PointerEvent } from "react";

const GAP = 8;
const EDGE = 16;

export function PhoneSelectionCommentButton({
	rect,
	onComment,
}: {
	rect: DOMRect | null;
	onComment: () => void;
}) {
	if (!rect) return null;
	const commentBeforeTapClearsSelection = (event: PointerEvent) => {
		event.preventDefault();
		onComment();
	};
	return (
		<Button
			variant="contained"
			onPointerDown={commentBeforeTapClearsSelection}
			onClick={onComment}
			sx={{
				position: "fixed",
				zIndex: (t) => t.zIndex.modal + 1,
				top: rect.bottom + GAP,
				left: Math.max(EDGE, rect.left),
				boxShadow: 4,
			}}
		>
			Comment
		</Button>
	);
}
