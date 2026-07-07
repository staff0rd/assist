import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useState } from "react";
import type { PrSummary } from "../prList";
import type { ReviewMode } from "./ReviewDropdown";
import { ReviewPrList } from "./ReviewPrList";

export function ReviewDropdownContent({
	cwd,
	onSelect,
	close,
}: {
	cwd: string;
	onSelect: (pr: PrSummary, mode: ReviewMode) => void;
	close: () => void;
}) {
	const [mode, setMode] = useState<ReviewMode>("review");

	return (
		<ReviewPrList
			cwd={cwd}
			header={
				<RadioGroup
					row
					value={mode}
					onChange={(e) => setMode(e.target.value as ReviewMode)}
					sx={{ px: 1.5, py: 0.5 }}
				>
					<FormControlLabel
						value="review"
						control={<Radio size="small" />}
						label="Review"
						onMouseDown={(e) => e.preventDefault()}
						slotProps={{ typography: { sx: { fontSize: 13 } } }}
					/>
					<FormControlLabel
						value="review-comments"
						control={<Radio size="small" />}
						label="Address Comments"
						onMouseDown={(e) => e.preventDefault()}
						slotProps={{ typography: { sx: { fontSize: 13 } } }}
					/>
					<FormControlLabel
						value="review-post"
						control={<Radio size="small" />}
						label="Review & post"
						onMouseDown={(e) => e.preventDefault()}
						slotProps={{ typography: { sx: { fontSize: 13 } } }}
					/>
				</RadioGroup>
			}
			onPick={(pr) => {
				onSelect(pr, mode);
				close();
			}}
		/>
	);
}
