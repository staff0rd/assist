import Chip from "@mui/material/Chip";

export function UsagePeakResetChip() {
	return (
		<Chip
			label="reset"
			size="small"
			color="warning"
			variant="outlined"
			title="Quota reset mid-cycle — this is the peak reached before the reset."
			sx={{ ml: 1 }}
		/>
	);
}
