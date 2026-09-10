import { Box, Link, Tooltip } from "@mui/material";
import type { ReactNode } from "react";

const iconLinkSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.375,
	whiteSpace: "nowrap",
	"& svg": { fontSize: 14 },
} as const;

export function TrackerIconLink({
	icon,
	label,
	title,
	url,
}: {
	icon?: ReactNode;
	label: string;
	title: string;
	url?: string;
}) {
	if (!url)
		return (
			<Tooltip title={title}>
				<Box component="span" sx={{ ...iconLinkSx, color: "text.disabled" }}>
					{icon}
					{label}
				</Box>
			</Tooltip>
		);

	return (
		<Tooltip title={title}>
			<Link
				href={url}
				target="_blank"
				rel="noopener"
				underline="hover"
				sx={iconLinkSx}
			>
				{icon}
				{label}
			</Link>
		</Tooltip>
	);
}
