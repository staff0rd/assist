import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { GitStatusCounts as GitStatusCountsData } from "../parseGitStatus";
import { useGitStatusCounts } from "./useGitStatusCounts";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	ml: 2,
	fontFamily: "monospace",
	fontSize: 13,
	cursor: "default",
} as const;

const tooltipContentSx = {
	maxHeight: 360,
	overflow: "auto",
	fontFamily: "monospace",
	fontSize: 12,
} as const;

const tooltipSlotProps = {
	tooltip: { sx: { maxWidth: "none" } },
} as const;

const GROUPS = [
	{ key: "new", label: "New", prefix: "+", color: "success.main" },
	{ key: "modified", label: "Modified", prefix: "~", color: "warning.main" },
	{ key: "deleted", label: "Deleted", prefix: "-", color: "error.main" },
] as const;

function GitStatusTooltip({ counts }: { counts: GitStatusCountsData }) {
	return (
		<Box sx={tooltipContentSx}>
			{GROUPS.filter((g) => counts[g.key].length > 0).map((g) => (
				<Box key={g.key} sx={{ mb: 0.5, "&:last-child": { mb: 0 } }}>
					<Box sx={{ color: g.color, fontWeight: 700 }}>
						{g.label} ({counts[g.key].length})
					</Box>
					{counts[g.key].map((path) => (
						<Box key={path} sx={{ pl: 1, whiteSpace: "nowrap" }}>
							{path}
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
}

export function GitStatusCounts({ cwd }: { cwd: string }) {
	const counts = useGitStatusCounts(cwd);

	const groups = counts
		? GROUPS.map((g) => ({ ...g, count: counts[g.key].length })).filter(
				(g) => g.count > 0,
			)
		: [];
	if (!counts || groups.length === 0) return null;

	return (
		<Tooltip
			title={<GitStatusTooltip counts={counts} />}
			slotProps={tooltipSlotProps}
		>
			<Box sx={containerSx}>
				{groups.map((g) => (
					<Box key={g.key} component="span" sx={{ color: g.color }}>
						{g.prefix}
						{g.count}
					</Box>
				))}
			</Box>
		</Tooltip>
	);
}
