import Alert from "@mui/material/Alert";
import type { PickupState } from "./useStartPickup";

export function NextPickupStatus({ picking, error, clearError }: PickupState) {
	if (picking)
		return (
			<Alert severity="info">
				Assigning {picking.repo}#{picking.number} to you and moving it to In
				Progress…
			</Alert>
		);
	if (!error) return null;
	return (
		<Alert severity="error" onClose={clearError}>
			{error}
		</Alert>
	);
}
