import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SessionInfo } from "../../../../../../../types";
import { useElapsed } from "./SessionTopBarElapsed/useElapsed";

export const elapsedSizers = ["00m 00s", "00h 00m"];

const elapsedSx = {
	display: "inline-grid",
	flexShrink: 0,
	whiteSpace: "nowrap",
	color: "text.disabled",
	fontVariantNumeric: "tabular-nums",
	textAlign: "right",
} as const;

const cellSx = { gridArea: "1 / 1" } as const;

export function SessionTopBarElapsed({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);

	return (
		<Typography variant="caption" sx={elapsedSx}>
			{elapsedSizers.map((sizer) => (
				<Box
					key={sizer}
					component="span"
					aria-hidden
					data-elapsed-sizer
					sx={{ ...cellSx, visibility: "hidden" }}
				>
					{sizer}
				</Box>
			))}
			<Box component="span" sx={cellSx}>
				{elapsed}
			</Box>
		</Typography>
	);
}
