import { Box, Popover, type PopoverActions } from "@mui/material";
import { useRef } from "react";
import {
	SelectionCommentBody,
	type SelectionCommentBodyProps,
} from "./SelectionCommentBody";
import { useRepositionOnContentResize } from "./useRepositionOnContentResize";

export type SelectionAnchor = {
	quote: string;
	top: number;
	left: number;
};

const boxSx = {
	p: 1.5,
	width: 340,
	display: "flex",
	flexDirection: "column",
	gap: 1,
} as const;

export function SelectionCommentPopover({
	pending,
	...body
}: SelectionCommentBodyProps & { pending: SelectionAnchor | null }) {
	const open = pending !== null;
	const actions = useRef<PopoverActions | null>(null);
	const content = useRef<HTMLDivElement | null>(null);

	useRepositionOnContentResize(actions, content, open);

	return (
		<Popover
			open={open}
			action={actions}
			onClose={body.onCancel}
			anchorReference="anchorPosition"
			anchorPosition={
				pending ? { top: pending.top, left: pending.left } : undefined
			}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
		>
			<Box ref={content} sx={boxSx}>
				<SelectionCommentBody
					{...body}
					quote={pending?.quote ?? ""}
					open={open}
				/>
			</Box>
		</Popover>
	);
}
