import { MenuList, Paper } from "@mui/material";
import { type FocusEvent, type KeyboardEvent, useState } from "react";
import { azureDevopsPrActions } from "../../../shared/azureDevops/azureDevopsPrActions";
import { prActions } from "../../../shared/prActions";
import { reviewOptionDefaults } from "../../../shared/reviewOptionFlags";
import { ReviewMenuRow } from "../../sessions/web/ui/App/ReviewMenuRow";
import { reviewModeEntries } from "../../sessions/web/ui/App/reviewModeEntries";
import { popoverPaperSx } from "./popoverPaperSx";
import { reviewModeItems } from "./reviewModeItems";
import { useAssistHarness } from "./useAssistHarness";

export function AssistReviewMenu({
	actionsOnly = false,
	onPick,
	onClose,
}: {
	actionsOnly?: boolean;
	onPick: (args: string[]) => void;
	onClose: (restoreFocus: boolean) => void;
}) {
	const [options, setOptions] = useState(reviewOptionDefaults);
	const capabilities = useAssistHarness();

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Escape") return;
		event.preventDefault();
		onClose(true);
	};

	const closeWhenFocusLeaves = (event: FocusEvent<HTMLElement>) => {
		if (event.currentTarget.contains(event.relatedTarget as Node | null))
			return;
		if (document.hasFocus()) onClose(false);
	};

	return (
		<Paper sx={popoverPaperSx}>
			<MenuList
				autoFocusItem
				dense
				aria-label="Start an assist session for this PR"
				onKeyDown={onKeyDown}
				onBlur={closeWhenFocusLeaves}
			>
				{!actionsOnly &&
					reviewModeItems(capabilities, options, setOptions, onPick)}
				{reviewModeEntries(
					capabilities,
					actionsOnly ? azureDevopsPrActions : prActions,
				).map((entry) => (
					<ReviewMenuRow
						key={entry.label}
						entry={entry}
						onSelect={(_, args) => onPick(args)}
					/>
				))}
			</MenuList>
		</Paper>
	);
}
