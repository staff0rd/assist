import { Divider, MenuItem } from "@mui/material";
import { prActions } from "../../../../../../../shared/prActions";
import type { PrSummary } from "../../../../prList";
import type { HarnessCapabilities } from "../../../useHarnessCapabilities";
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
			{reviewModeEntries(capabilities, prActions).map(({ label, args }) => (
				<MenuItem key={label} onClick={() => onSelect(args)}>
					{label}
				</MenuItem>
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
