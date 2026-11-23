import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { phoneEmptySx } from "../phoneEmptySx";
import { PhoneFailureBanner } from "./PhoneFailureBanner";
import { PhoneScheduleCard } from "./PhoneScheduleCard";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";
import type { PhoneAutopilot } from "./usePhoneAutopilot";

export function PhoneAutopilotBody({
	autopilot: { repos, state, actions },
}: {
	autopilot: PhoneAutopilot;
}) {
	if (repos.length === 0)
		return (
			<Box sx={phoneEmptySx}>Autopilot isn't configured on this node.</Box>
		);
	if (state.loading) return <Box sx={phoneEmptySx}>Loading…</Box>;
	const problem = actions.error ?? state.error;
	return (
		<>
			{problem && (
				<Alert severity="error" sx={sx.alert}>
					{problem}
				</Alert>
			)}
			{state.status ? (
				<>
					{state.status.failure && (
						<PhoneFailureBanner failure={state.status.failure} />
					)}
					<PhoneScheduleCard
						status={state.status}
						via={state.via}
						busy={actions.busy}
						onAction={(action) => void actions.run(action)}
					/>
				</>
			) : (
				!problem && (
					<Box sx={phoneEmptySx}>
						Autopilot isn't configured for this repo. Set
						autopilot.intervalMinutes, autopilot.prompt and autopilot.node.
					</Box>
				)
			)}
		</>
	);
}
