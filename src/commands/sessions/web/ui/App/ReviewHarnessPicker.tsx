import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { harnessLabel } from "../../../../../shared/harnessLabel";
import type { HarnessKind } from "../../../../../shared/harnesses";

export function ReviewHarnessPicker({
	choices,
	value,
	onChange,
}: {
	choices: HarnessKind[];
	value: HarnessKind;
	onChange: (harness: HarnessKind) => void;
}) {
	if (choices.length < 2) return null;
	return (
		<ToggleButtonGroup
			exclusive
			size="small"
			value={value}
			aria-label="Harness"
			onChange={(_event, next: HarnessKind | null) => next && onChange(next)}
			onClick={(e) => e.stopPropagation()}
			sx={{ px: 2, py: 0.5 }}
		>
			{choices.map((kind) => (
				<ToggleButton key={kind} value={kind} sx={{ px: 1.5, py: 0.25 }}>
					{harnessLabel(kind)}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
