import { Paper } from "@mui/material";
import type { ReactNode } from "react";
import { AssistInstructionsField } from "./AssistInstructionsField";
import { AssistPopoverButtons } from "./AssistPopoverButtons";
import { AssistPopoverFooter } from "./AssistPopoverFooter";
import { popoverPaperSx } from "./popoverPaperSx";
import { useInstructions } from "./useInstructions";
import { usePopoverHandlers } from "./usePopoverHandlers";

export function AssistPopover({
	onSend,
	onClose,
	placeholder = "Instructions (optional)",
	error,
	busy = false,
	keepDraftOnBlur = false,
	copyWhenEmpty,
	initialInstructions = "",
	onInstructionsChange,
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
	initialInstructions?: string;
	onInstructionsChange?: (instructions: string) => void;
	buttons?: string[];
	children?: ReactNode;
}) {
	const [instructions, changeInstructions] = useInstructions(
		initialInstructions,
		onInstructionsChange,
	);
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
				onChange={changeInstructions}
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
