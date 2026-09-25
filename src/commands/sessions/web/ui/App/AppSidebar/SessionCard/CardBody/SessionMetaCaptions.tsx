import Typography from "@mui/material/Typography";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import { contextColor } from "../../../statusColors";

export function SessionMetaCaptions({
	restored,
	usedPct,
	harness,
	undurable,
}: {
	restored?: boolean;
	usedPct?: number;
	harness?: HarnessKind;
	undurable?: { reason: string };
}) {
	return (
		<>
			{undurable && (
				<Typography variant="caption" sx={{ color: "warning.main" }}>
					{undurable.reason}
				</Typography>
			)}
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{ color: restored ? "success.main" : "warning.main" }}
				>
					{restored ? "restored" : "not restored"}
				</Typography>
			)}
			{usedPct !== undefined && (
				<Typography
					variant="caption"
					sx={{
						color: contextColor(usedPct, harness),
						opacity: 0.6,
						fontSize: "0.8rem",
					}}
				>
					{Math.round(usedPct)}%
				</Typography>
			)}
		</>
	);
}
