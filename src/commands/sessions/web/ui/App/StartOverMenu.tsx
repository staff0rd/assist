import { Menu, MenuItem } from "@mui/material";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";

export function StartOverMenu({
	id,
	onStartOver,
	anchor,
	onClose,
}: {
	id: string;
	onStartOver: () => void;
	anchor: HTMLElement | null;
	onClose: () => void;
}) {
	const startOver = useShiftSkipConfirm(() => {
		onClose();
		onStartOver();
	});
	return (
		<>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={onClose}
				onClick={(event) => event.stopPropagation()}
			>
				<MenuItem
					title={startOver.withHint("Start over")}
					{...startOver.triggerHandlers}
					onClick={(event) => {
						onClose();
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
