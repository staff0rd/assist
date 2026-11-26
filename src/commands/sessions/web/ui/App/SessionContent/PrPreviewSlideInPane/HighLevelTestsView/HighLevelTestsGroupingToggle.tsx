import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { HighLevelTestsGrouping } from "./useHighLevelTestsGrouping";

export function HighLevelTestsGroupingToggle({
	grouping,
	onChange,
}: {
	grouping: HighLevelTestsGrouping;
	onChange: (grouping: HighLevelTestsGrouping) => void;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={grouping}
			aria-label="Test view"
			onChange={(_event, next: HighLevelTestsGrouping | null) =>
				next && onChange(next)
			}
			sx={{ flex: "0 0 auto", ml: "auto" }}
		>
			<ToggleButton value="when">By when</ToggleButton>
			<ToggleButton value="written">As written</ToggleButton>
		</ToggleButtonGroup>
	);
}
