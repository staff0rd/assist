import { MenuItem } from "@mui/material";
import { reviewButtonModes } from "../../../../../../../shared/reviewButtonModes";
import { ReviewHarnessPicker } from "../../ReviewHarnessPicker";
import { reviewModeEntries } from "../../reviewModeEntries";
import type { useReviewDialogHarness } from "./useReviewDialogHarness";

export function ReviewModeMenuItems({
	harness: { capabilities, choices, harness, setHarness },
	onSelect,
}: {
	harness: ReturnType<typeof useReviewDialogHarness>;
	onSelect: (args: string[]) => void;
}) {
	return (
		<>
			<ReviewHarnessPicker
				choices={choices}
				value={harness}
				onChange={setHarness}
			/>
			{reviewModeEntries(capabilities, reviewButtonModes, harness).map(
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
		</>
	);
}
