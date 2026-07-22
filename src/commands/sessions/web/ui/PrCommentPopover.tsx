import { Box, Popover } from "@mui/material";
import { CommentNoteForm } from "./CommentNoteForm";
import { QuoteBlock } from "./QuoteBlock";

export type PendingComment = {
	quote: string;
	top: number;
	left: number;
	start: number;
	end: number;
};

const boxSx = {
	p: 1.5,
	width: 340,
	display: "flex",
	flexDirection: "column",
	gap: 1,
} as const;

export function PrCommentPopover({
	pending,
	onAdd,
	onCancel,
}: {
	pending: PendingComment | null;
	onAdd: (note: string) => void;
	onCancel: () => void;
}) {
	return (
		<Popover
			open={pending !== null}
			onClose={onCancel}
			anchorReference="anchorPosition"
			anchorPosition={
				pending ? { top: pending.top, left: pending.left } : undefined
			}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
		>
			<Box sx={boxSx}>
				<QuoteBlock text={pending?.quote ?? ""} />
				<CommentNoteForm onAdd={onAdd} onCancel={onCancel} />
			</Box>
		</Popover>
	);
}
