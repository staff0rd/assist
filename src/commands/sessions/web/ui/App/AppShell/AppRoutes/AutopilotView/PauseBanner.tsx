import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import type { AutopilotFailure } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { failureWhere } from "./failureWhere";

export function PauseBanner({
	failure,
	busy,
	onResume,
}: {
	failure: AutopilotFailure;
	busy: boolean;
	onResume: () => void;
}) {
	const where = failureWhere(failure);
	return (
		<Alert
			severity="error"
			sx={{ mb: 3 }}
			action={
				<Button
					variant="contained"
					size="small"
					disabled={busy}
					onClick={onResume}
				>
					Resume
				</Button>
			}
		>
			<strong>Paused after a failure{where ? ` in ${where}` : ""}.</strong>{" "}
			{failure.reason}. No more ticks run until you resume.
		</Alert>
	);
}
