import Box from "@mui/material/Box";
import type { AutopilotFailure } from "../../../../daemon/autopilot/AutopilotRecord";
import { failureWhere } from "../../App/AppShell/AppRoutes/AutopilotView/failureWhere";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";

export function PhoneFailureBanner({ failure }: { failure: AutopilotFailure }) {
	const where = failureWhere(failure);
	return (
		<Box role="alert" sx={sx.banner}>
			<strong>Paused after a failure{where ? ` in ${where}` : ""}.</strong>{" "}
			{failure.reason}. No more ticks run until you resume.
		</Box>
	);
}
