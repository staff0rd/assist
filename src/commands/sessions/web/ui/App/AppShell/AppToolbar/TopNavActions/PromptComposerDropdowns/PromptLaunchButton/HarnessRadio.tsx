import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../shared/harnessLabel";

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function HarnessRadio({
	choices,
	value,
	onChange,
}: {
	choices: HarnessKind[];
	value: HarnessKind;
	onChange: (harness: HarnessKind) => void;
}) {
	return (
		<RadioGroup
			row
			value={value}
			onChange={(e) => onChange(e.target.value as HarnessKind)}
			onMouseDown={(e) => e.preventDefault()}
		>
			{choices.map((choice) => (
				<FormControlLabel
					key={choice}
					value={choice}
					control={<Radio size="small" />}
					label={harnessLabel(choice)}
					sx={labelSx}
				/>
			))}
		</RadioGroup>
	);
}
