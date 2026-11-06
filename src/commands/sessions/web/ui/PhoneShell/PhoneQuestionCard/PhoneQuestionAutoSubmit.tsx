import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export function PhoneQuestionAutoSubmit({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (enabled: boolean) => void;
}) {
	return (
		<FormControlLabel
			sx={{ m: 0, pt: 1, alignSelf: "flex-end" }}
			control={
				<Switch
					size="small"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
				/>
			}
			label="Auto submit"
			slotProps={{
				typography: { variant: "caption", color: "text.secondary" },
			}}
		/>
	);
}
