import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { StopCardActivation } from "./StopCardActivation";

export function CardToggle({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (enabled: boolean) => void;
}) {
	return (
		<StopCardActivation>
			<FormControlLabel
				sx={{ m: 0, mt: 0.5 }}
				control={
					<Switch
						size="small"
						checked={checked}
						onChange={(e) => onChange(e.target.checked)}
					/>
				}
				label={label}
				slotProps={{
					typography: { variant: "caption", color: "text.secondary" },
				}}
			/>
		</StopCardActivation>
	);
}
