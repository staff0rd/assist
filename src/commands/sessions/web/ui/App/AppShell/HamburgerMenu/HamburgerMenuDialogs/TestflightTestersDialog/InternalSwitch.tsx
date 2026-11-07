import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export function InternalSwitch({
	sheet,
	checked,
	disabled,
	onChange,
}: {
	sheet: boolean;
	checked: boolean;
	disabled: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<FormControlLabel
			control={
				<Switch
					checked={checked}
					onChange={(event) => onChange(event.target.checked)}
					disabled={disabled}
				/>
			}
			label="Internal"
			sx={{ mr: 0, flex: sheet ? 1 : undefined }}
		/>
	);
}
