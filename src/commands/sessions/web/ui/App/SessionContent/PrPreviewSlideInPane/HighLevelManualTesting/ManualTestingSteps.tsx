import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelManualTesting } from "../../../../../../../review/highLevel/types";

export function ManualTestingSteps({
	steps,
	text,
}: {
	steps: HighLevelManualTesting["steps"];
	text: (value: string) => ReactNode;
}) {
	return (
		<Box
			component="ol"
			aria-label="Manual testing steps"
			sx={{ m: 0, pl: 3, display: "flex", flexDirection: "column", gap: 0.75 }}
		>
			{steps.map((step, index) => (
				<Typography
					key={`${index}:${step.action}`}
					component="li"
					variant="body2"
				>
					{text(step.action)}
					<Box component="span" sx={{ color: "text.secondary", mx: 0.75 }}>
						→
					</Box>
					<Box component="span" sx={{ color: "text.secondary" }}>
						{text(step.expect)}
					</Box>
				</Typography>
			))}
		</Box>
	);
}
