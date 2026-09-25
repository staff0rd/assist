import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { ReleaseEdgeGeometry } from "./measureReleaseEdges";

const svgSx = {
	position: "absolute",
	inset: 0,
	overflow: "visible",
	pointerEvents: "none",
	zIndex: 0,
} as const;

export function ReleaseEdges({
	edges,
	promoted,
	geometry,
}: {
	edges: [string, string][];
	promoted: boolean[];
	geometry: ReleaseEdgeGeometry;
}) {
	const theme = useTheme();
	const { width, height, paths } = geometry;
	if (width === 0 || height === 0) return null;

	return (
		<Box
			component="svg"
			sx={svgSx}
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			aria-hidden="true"
		>
			{edges.map(([from, to], index) => {
				const d = paths[index];
				if (!d) return null;
				const done = promoted[index] ?? false;
				return (
					<path
						key={`${from}\u0000${to}`}
						d={d}
						fill="none"
						strokeWidth={1.5}
						stroke={
							done ? theme.palette.primary.main : theme.palette.text.disabled
						}
						strokeDasharray={done ? undefined : "3 4"}
					>
						<title>
							{done
								? `${from} → ${to}: promoted — the target carries the source's commit`
								: `${from} → ${to}: not promoted yet`}
						</title>
					</path>
				);
			})}
		</Box>
	);
}
