import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink } from "react-router";
import { GitStatusTooltip, type StatusGroup } from "./GitStatusTooltip";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	ml: 2,
	fontFamily: "monospace",
	fontSize: 13,
} as const;

const tooltipSlotProps = {
	tooltip: { sx: { maxWidth: "none" } },
} as const;

export const GROUPS = [
	{ key: "new", label: "New", prefix: "+", color: "success.main" },
	{ key: "modified", label: "Modified", prefix: "~", color: "warning.main" },
	{ key: "deleted", label: "Deleted", prefix: "-", color: "error.main" },
] as const;

function GitStatusChips({ groups }: { groups: StatusGroup[] }) {
	return groups.map((g) => (
		<Box key={g.key} component="span" sx={{ color: g.color }}>
			{g.prefix}
			{g.count}
		</Box>
	));
}

export function GitStatusLink({ groups }: { groups: StatusGroup[] }) {
	return (
		<Tooltip
			title={<GitStatusTooltip groups={groups} />}
			slotProps={tooltipSlotProps}
		>
			<Link
				component={RouterLink}
				to="/diff"
				underline="hover"
				color="inherit"
				sx={containerSx}
			>
				<GitStatusChips groups={groups} />
			</Link>
		</Tooltip>
	);
}
