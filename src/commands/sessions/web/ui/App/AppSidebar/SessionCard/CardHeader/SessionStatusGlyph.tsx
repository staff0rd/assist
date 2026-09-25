import { keyframes } from "@emotion/react";
import Typography from "@mui/material/Typography";
import { SessionRunningDot } from "../../../SessionRunningDot";
import { statusColors } from "../../../statusColors";
import { statusGlyph } from "./SessionStatusGlyph/statusGlyph";
import type { SessionStatus } from "../../../../types";

const pulse = keyframes`
	0%, 100% { opacity: 1; }
	50% { opacity: 0.35; }
`;

const glyphSx = {
	gridColumn: 1,
	gridRow: 1,
	fontSize: "0.7rem",
	lineHeight: "20px",
	textAlign: "center",
} as const;

const pulsingGlyphSx = {
	...glyphSx,
	animation: `${pulse} 1.4s ease-in-out infinite`,
	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

export function SessionStatusGlyph({ status }: { status: SessionStatus }) {
	if (status === "running") return <SessionRunningDot />;
	return (
		<Typography
			variant="caption"
			sx={{
				...(status === "waiting" ? pulsingGlyphSx : glyphSx),
				color: statusColors[status],
			}}
			title={status}
		>
			{statusGlyph[status]}
		</Typography>
	);
}
