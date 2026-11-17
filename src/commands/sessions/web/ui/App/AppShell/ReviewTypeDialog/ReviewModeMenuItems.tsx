import { prActions } from "../../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../../../parseHarnessCapabilities";
import { ReviewMenuRow } from "../../ReviewMenuRow";
import { reviewModeEntries } from "../../reviewModeEntries";

export function ReviewModeMenuItems({
	capabilities,
	onSelect,
}: {
	capabilities: HarnessCapabilities;
	onSelect: (args: string[]) => void;
}) {
	return reviewModeEntries(capabilities, reviewButtonModes, [
		...reviewButtonModes,
		...prActions,
	]).map((entry) => (
		<ReviewMenuRow
			key={entry.label}
			entry={entry}
			onSelect={(_e, args) => onSelect(args)}
		/>
	));
}
