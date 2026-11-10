import { Divider, MenuItem } from "@mui/material";
import { prActions } from "../../../../../../../shared/prActions";
import type { PrSummary } from "../../../../prList";
import type { HarnessCapabilities } from "../../../useHarnessCapabilities";
import { reviewModeEntries } from "../../reviewModeEntries";
import type { HarnessKind } from "../../../../../../../shared/harnesses";

export function PrActionItems({
	pr,
	capabilities,
	harness,
	onSelect,
	onCancel,
}: {
	pr: PrSummary;
	capabilities: HarnessCapabilities;
	harness: HarnessKind;
	onSelect: (args: string[]) => void;
	onCancel: () => void;
}) {
	return (
		<>
			{reviewModeEntries(capabilities, prActions, harness).map(
				({ label, args, disabled }) => (
					<MenuItem
						key={label}
						disabled={disabled}
						onClick={() => onSelect(args)}
					>
						{label}
					</MenuItem>
				),
			)}
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
