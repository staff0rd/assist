import { MenuList } from "@mui/material";
import { type KeyboardEvent, type Ref, useState } from "react";
import { azureDevopsPrActions } from "../../../shared/azureDevops/azureDevopsPrActions";
import { prActions } from "../../../shared/prActions";
import { reviewOptionDefaults } from "../../../shared/reviewOptionFlags";
import { ReviewMenuRow } from "../../sessions/web/ui/App/ReviewMenuRow";
import { reviewModeEntries } from "../../sessions/web/ui/App/reviewModeEntries";
import { reviewModeItems } from "./reviewModeItems";
import { useAssistHarness } from "./useAssistHarness";

export function AssistReviewMenuList({
	menuRef,
	actionsOnly,
	autoFocusItem,
	onPick,
	onClose,
}: {
	menuRef: Ref<HTMLUListElement>;
	actionsOnly: boolean;
	autoFocusItem: boolean;
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

	return (
		<MenuList
			ref={menuRef}
			autoFocusItem={autoFocusItem}
			dense
			aria-label="Start an assist session for this PR"
			onKeyDown={onKeyDown}
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
	);
}
