import { reviewButtonModes } from "../../../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../../../useHarnessCapabilities";
import { ReviewMenuRow } from "../../ReviewMenuRow";
import { reviewModeEntries } from "../../reviewModeEntries";

export function ReviewModeMenuItems({
	capabilities,
	onSelect,
}: {
	capabilities: HarnessCapabilities;
	onSelect: (args: string[]) => void;
}) {
	return reviewModeEntries(capabilities, reviewButtonModes).map((entry) => (
		<ReviewMenuRow
			key={entry.label}
			entry={entry}
			onSelect={(_e, args) => onSelect(args)}
		/>
	));
}
