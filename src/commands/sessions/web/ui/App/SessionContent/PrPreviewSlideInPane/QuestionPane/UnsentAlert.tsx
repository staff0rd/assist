import { Alert } from "@mui/material";

export function UnsentAlert() {
	return (
		<Alert severity="error" sx={{ mx: 2, mt: 2 }}>
			Not sent: the connection to the sessions server is down. Try again once it
			reconnects.
		</Alert>
	);
}
