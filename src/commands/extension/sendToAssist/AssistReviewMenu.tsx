import { Paper } from "@mui/material";
import { useRef } from "react";
import { AssistReviewMenuList } from "./AssistReviewMenuList";
import { AssistReviewPromptField } from "./AssistReviewPromptField";
import { closeWhenFocusLeaves } from "./closeWhenFocusLeaves";
import { focusFirstMenuItem } from "./focusFirstMenuItem";
import { popoverPaperSx } from "./popoverPaperSx";

export function AssistReviewMenu({
	actionsOnly = false,
	onPick,
	onPrompt,
	onClose,
}: {
	actionsOnly?: boolean;
	onPick: (args: string[]) => void;
	onPrompt?: (instructions: string) => void;
	onClose: (restoreFocus: boolean) => void;
}) {
	const menuRef = useRef<HTMLUListElement>(null);
	return (
		<Paper sx={popoverPaperSx} onBlur={closeWhenFocusLeaves(false, onClose)}>
			{onPrompt && (
				<AssistReviewPromptField
					onPrompt={onPrompt}
					onClose={onClose}
					focusMenu={() => focusFirstMenuItem(menuRef.current)}
				/>
			)}
			<AssistReviewMenuList
				menuRef={menuRef}
				actionsOnly={actionsOnly}
				autoFocusItem={!onPrompt}
				onPick={onPick}
				onClose={onClose}
			/>
		</Paper>
	);
}
