import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export function AutoRunToggle({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (enabled: boolean) => void;
}) {
	return (
		<FormControlLabel
			sx={{ m: 0, mt: 0.5 }}
			// The card is a ButtonBase; stop clicks here from selecting it
			onClick={(e) => e.stopPropagation()}
			control={
				<Switch
					size="small"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
				/>
			}
			label="Auto-run"
			slotProps={{
				typography: { variant: "caption", color: "text.secondary" },
			}}
		/>
	);
}
