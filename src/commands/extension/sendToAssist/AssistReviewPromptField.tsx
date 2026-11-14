import { Box, Button } from "@mui/material";
import { type KeyboardEvent, useState } from "react";
import { AssistInstructionsField } from "./AssistInstructionsField";
import { popoverKeyDown } from "./popoverKeyDown";

export function AssistReviewPromptField({
	onPrompt,
	onClose,
	focusMenu,
}: {
	onPrompt: (instructions: string) => void;
	onClose: (restoreFocus: boolean) => void;
	focusMenu: () => void;
}) {
	const [instructions, setInstructions] = useState("");
	const submit = () => onPrompt(instructions);
	const sendOrClose = popoverKeyDown(onClose, submit);

	const onKeyDown = (event: KeyboardEvent) => {
		const target = event.target as HTMLTextAreaElement;
		const atEnd = target.selectionStart === target.value.length;
		if (
			(event.key === "Tab" && !event.shiftKey) ||
			(event.key === "ArrowDown" && atEnd)
		) {
			event.preventDefault();
			focusMenu();
			return;
		}
		sendOrClose(event);
	};

	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "center", p: 1 }}>
			<AssistInstructionsField
				value={instructions}
				onChange={setInstructions}
				onKeyDown={onKeyDown}
				placeholder="Ask about this PR"
				error={false}
			/>
			<Button
				size="small"
				variant="contained"
				onMouseDown={(event) => event.preventDefault()}
				onClick={submit}
			>
				Prompt
			</Button>
		</Box>
	);
}
