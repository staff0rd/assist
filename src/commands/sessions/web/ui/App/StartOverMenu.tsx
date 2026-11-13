import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";

export function StartOverMenu({
	id,
	onStartOver,
}: {
	id: string;
	onStartOver: () => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const startOver = useShiftSkipConfirm(onStartOver);
	return (
		<>
			<IconButton
				size="small"
				aria-label="Restart options"
				aria-haspopup="menu"
				aria-expanded={anchor !== null}
				onClick={(event) => {
					event.stopPropagation();
					setAnchor(event.currentTarget);
				}}
			>
				<ArrowDropDownIcon sx={{ fontSize: 16 }} />
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={() => setAnchor(null)}
				onClick={(event) => event.stopPropagation()}
			>
				<MenuItem
					title={startOver.withHint("Start over")}
					{...startOver.triggerHandlers}
					onClick={(event) => {
						setAnchor(null);
						startOver.triggerHandlers.onClick(event);
					}}
				>
					Start over
				</MenuItem>
			</Menu>
			{startOver.confirming && (
				<ConfirmDialog
					title={`Start over session ${id}`}
					message="Start over? The conversation history is discarded. This stops the running process and starts a new conversation with only the initial prompt, or opens idle if there was none."
					confirmLabel="Start over"
					onConfirm={() => {
						startOver.close();
						onStartOver();
					}}
					onCancel={startOver.close}
				/>
			)}
		</>
	);
}
