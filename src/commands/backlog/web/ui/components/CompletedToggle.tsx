import { FormControlLabel, Switch } from "@mui/material";
import { useShowCompleted } from "../useShowCompleted";

export function CompletedToggle() {
	const [showCompleted, setShowCompleted] = useShowCompleted();

	return (
		<FormControlLabel
			control={
				<Switch
					checked={showCompleted}
					onChange={() => setShowCompleted(!showCompleted)}
					size="small"
				/>
			}
			label="Show completed"
			slotProps={{
				typography: { variant: "body2", color: "text.secondary" },
			}}
		/>
	);
}
