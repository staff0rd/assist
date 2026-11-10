import { Divider, MenuItem } from "@mui/material";
import { ReviewMenuRow } from "../../ReviewMenuRow";
import { prActions } from "../../../../../../../shared/prActions";
import type { PrSummary } from "../../../../prList";
import type { HarnessCapabilities } from "../../../parseHarnessCapabilities";
import { reviewModeEntries } from "../../reviewModeEntries";

export function PrActionItems({
	pr,
	capabilities,
	onSelect,
	onCancel,
}: {
	pr: PrSummary;
	capabilities: HarnessCapabilities;
	onSelect: (args: string[]) => void;
	onCancel: () => void;
}) {
	return (
		<>
			{reviewModeEntries(capabilities, prActions).map((entry) => (
				<ReviewMenuRow
					key={entry.label}
					entry={entry}
					onSelect={(_e, args) => onSelect(args)}
				/>
			))}
			<Divider />
			<MenuItem
				onClick={() => {
					window.open(pr.url, "_blank");
					onCancel();
				}}
			>
				Open in GitHub
			</MenuItem>
		</>
	);
}
