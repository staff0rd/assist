import { Paper } from "@mui/material";
import { type ReactNode, useState } from "react";
import { AssistInstructionsField } from "./AssistInstructionsField";
import { AssistPopoverButtons } from "./AssistPopoverButtons";
import { AssistPopoverFooter } from "./AssistPopoverFooter";
import { popoverPaperSx } from "./popoverPaperSx";
import { usePopoverHandlers } from "./usePopoverHandlers";

export function AssistPopover({
	onSend,
	onClose,
	placeholder = "Instructions (optional)",
	error,
	busy = false,
	keepDraftOnBlur = false,
	copyWhenEmpty,
	buttons,
	children,
}: {
	onSend: (instructions: string, button: number) => void;
	onClose: (restoreFocus: boolean) => void;
	placeholder?: string;
	error?: string;
	busy?: boolean;
	keepDraftOnBlur?: boolean;
	copyWhenEmpty?: string;
	buttons?: string[];
	children?: ReactNode;
}) {
	const [instructions, setInstructions] = useState("");
	const { send, onKeyDown, onBlur } = usePopoverHandlers({
		instructions,
		onSend,
		onClose,
		busy,
		keepOpen: Boolean(error),
		keepDraftOnBlur,
		copyWhenEmpty,
	});

	return (
		<Paper
			sx={(theme) => ({ ...popoverPaperSx(theme), p: 1.5 })}
			onBlur={onBlur}
		>
			<AssistInstructionsField
				value={instructions}
				onChange={setInstructions}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				error={Boolean(error)}
			/>
			{children}
			{buttons && (
				<AssistPopoverButtons labels={buttons} disabled={busy} onClick={send} />
			)}
			<AssistPopoverFooter error={error} busy={busy} />
		</Paper>
	);
}
