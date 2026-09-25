import { keyframes } from "@emotion/react";
import Typography from "@mui/material/Typography";
import { statusColors } from "./statusColors";
import type { SessionStatus } from "../types";

const pulse = keyframes`
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.35; transform: scale(0.8); }
`;

const dotSx = {
	flexShrink: 0,
	fontSize: "1.68rem",
	lineHeight: 0.6,
} as const;

const labelSx = { flexShrink: 0, whiteSpace: "nowrap" } as const;

const pulsingDotSx = {
	...dotSx,
	animation: `${pulse} 1.4s ease-in-out infinite`,
	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

export function SessionStatusDot({
	status,
	label = false,
}: {
	status: SessionStatus;
	label?: boolean;
}) {
	if (label)
		return (
			<Typography
				variant="caption"
				sx={{ ...labelSx, color: statusColors[status] }}
			>
				● {status}
			</Typography>
		);

	return (
		<Typography
			variant="caption"
			sx={{
				...(status === "waiting" ? pulsingDotSx : dotSx),
				color: statusColors[status],
			}}
			title={status}
		>
			●
		</Typography>
	);
}
