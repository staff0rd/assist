import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { statusPillSx } from "../../../../../../../../designSystem/statusPillSx";
import { statusGlyph } from "../../../../../../../../statusGlyph";
import { statusColors } from "../../../../../../../statusColors";
import type { DisplayStatus } from "../../../../../../../../displayStatus";
import { isAwaitingUser } from "../../../../../../../../isAwaitingUser";

const pulse = keyframes`
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.35; transform: scale(0.8); }
`;

const dotSx = {
	flexShrink: 0,
	fontSize: "1.68rem",
	lineHeight: 0.6,
} as const;

const pulsingDotSx = {
	...dotSx,
	animation: `${pulse} 1.4s ease-in-out infinite`,
	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

export function SessionStatusDot({
	status,
	label = false,
}: {
	status: DisplayStatus;
	label?: boolean;
}) {
	if (label)
		return (
			<Box component="span" sx={statusPillSx(statusColors[status])}>
				{statusGlyph[status]} {status}
			</Box>
		);

	return (
		<Typography
			variant="caption"
			sx={{
				...(isAwaitingUser(status) ? pulsingDotSx : dotSx),
				color: statusColors[status],
			}}
			title={status}
		>
			●
		</Typography>
	);
}
