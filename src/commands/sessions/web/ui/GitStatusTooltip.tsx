import Box from "@mui/material/Box";

const tooltipContentSx = {
	maxHeight: 360,
	overflow: "auto",
	fontFamily: "monospace",
	fontSize: 12,
} as const;

export type StatusGroup = {
	key: string;
	label: string;
	prefix: string;
	color: string;
	count: number;
	paths: readonly string[];
};

export function GitStatusTooltip({ groups }: { groups: StatusGroup[] }) {
	return (
		<Box sx={tooltipContentSx}>
			{groups.map((g) => (
				<Box key={g.key} sx={{ mb: 0.5, "&:last-child": { mb: 0 } }}>
					<Box sx={{ color: g.color, fontWeight: 700 }}>
						{g.label} ({g.count})
					</Box>
					{g.paths.map((path) => (
						<Box key={path} sx={{ pl: 1, whiteSpace: "nowrap" }}>
							{path}
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
}
