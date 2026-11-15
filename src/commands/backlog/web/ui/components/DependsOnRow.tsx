import { Box, Link, Typography } from "@mui/material";
import { Fragment } from "react";
import type { PhaseStatus } from "../types";
import { phaseAnchor } from "./itemSectionAnchor";

export type PhaseDependency = { number: number; status: PhaseStatus };

const rowSx = {
	display: "grid",
	gridTemplateColumns: "auto minmax(0, 1fr)",
	columnGap: 1.5,
	fontSize: "0.75rem",
	mt: 0.5,
	mb: 1,
} as const;

export function DependsOnRow({ dependsOn }: { dependsOn: PhaseDependency[] }) {
	return (
		<Box component="dl" sx={rowSx}>
			<Typography
				component="dt"
				sx={{ fontSize: "inherit", color: "text.secondary" }}
			>
				Depends on
			</Typography>
			<Typography component="dd" sx={{ fontSize: "inherit", m: 0 }}>
				{dependsOn.length === 0
					? "None"
					: dependsOn.map((dep, i) => (
							<Fragment key={dep.number}>
								{i > 0 && ", "}
								<Link href={`#${phaseAnchor(dep.number - 1).id}`}>
									Phase {dep.number}
								</Link>
								{dep.status === "done" && " (done)"}
							</Fragment>
						))}
			</Typography>
		</Box>
	);
}
