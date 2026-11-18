import Typography from "@mui/material/Typography";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { contextColor } from "../../../../statusColors";
import { sessionTextSize } from "../../../../sessionTextSize";
import { sessionTypeSize } from "../../../../sessionTypeSize";

const captionSize = sessionTypeSize("caption");

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
				<Typography
					variant="caption"
					sx={{ color: "warning.main", fontSize: captionSize }}
				>
					{undurable.reason}
				</Typography>
			)}
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{
						color: restored ? "success.main" : "warning.main",
						fontSize: captionSize,
					}}
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
						fontSize: sessionTextSize("0.8rem"),
					}}
				>
					{Math.round(usedPct)}%
				</Typography>
			)}
		</>
	);
}
