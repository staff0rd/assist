import { Divider } from "@mui/material";
import { reviewButtonModes } from "../../../shared/reviewButtonModes";
import {
	type ReviewOptions,
	reviewOptionArgs,
} from "../../../shared/reviewOptionFlags";
import { ReviewMenuRow } from "../../sessions/web/ui/App/ReviewMenuRow";
import { reviewModeEntries } from "../../sessions/web/ui/App/reviewModeEntries";
import type { HarnessCapabilities } from "../../sessions/web/ui/parseHarnessCapabilities";
import { AssistReviewToggles } from "./AssistReviewToggles";

export function reviewModeItems(
	capabilities: HarnessCapabilities,
	options: ReviewOptions,
	setOptions: (options: ReviewOptions) => void,
	onPick: (args: string[]) => void,
) {
	return [
		...reviewModeEntries(capabilities, reviewButtonModes).map((entry) => (
			<ReviewMenuRow
				key={entry.label}
				entry={entry}
				onSelect={(_, args) => onPick([...args, ...reviewOptionArgs(options)])}
			/>
		)),
		<Divider key="modes-divider" />,
		<AssistReviewToggles key="toggles" value={options} onChange={setOptions} />,
		<Divider key="toggles-divider" />,
	];
}
