import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function ChainToggle({
	label,
	title,
	checked,
	onChange,
}: {
	label: string;
	title: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<FormControlLabel
			control={
				<Checkbox
					size="small"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
				/>
			}
			label={label}
			title={title}
			sx={labelSx}
		/>
	);
}
