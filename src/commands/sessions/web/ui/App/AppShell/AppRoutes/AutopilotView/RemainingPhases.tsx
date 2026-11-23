import Box from "@mui/material/Box";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { itemRowSx } from "./itemRowSx";

export function RemainingPhases({
	remaining,
}: {
	remaining: AutopilotItemView["remaining"];
}) {
	if (remaining.length === 0) return null;
	return (
		<Box sx={itemRowSx.next}>
			<Box component="span" sx={itemRowSx.key}>
				next
			</Box>
			{remaining
				.map((phase) =>
					phase.number === null ? phase.name : `${phase.number} ${phase.name}`,
				)
				.join(" · ")}
		</Box>
	);
}
