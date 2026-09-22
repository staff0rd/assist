import Box from "@mui/material/Box";
import type { ReleaseEnvironmentState } from "../releases/types";
import { ReleaseMark } from "./ReleaseMark";
import { ReleaseNodeFacts } from "./ReleaseNodeFacts";
import { releaseNodeState, releaseToneColors } from "./releaseNodeState";

const nodeSx = {
	flex: "0 0 auto",
	minWidth: 150,
	borderRadius: 1,
	border: 1,
	px: 1,
	py: 0.5,
	bgcolor: "background.paper",
} as const;

const topSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	fontFamily: "monospace",
	fontWeight: 600,
	fontSize: 13,
} as const;

const glyphSx = { ml: "auto", fontSize: 11 } as const;

export function ReleaseEnvironmentNode({
	environment,
	repo,
	defaultBranch,
}: {
	environment: ReleaseEnvironmentState;
	repo: string;
	defaultBranch: string | null;
}) {
	const { tone, glyph, tooltip } = releaseNodeState(environment, defaultBranch);

	return (
		<Box
			sx={{
				...nodeSx,
				borderColor: releaseToneColors[tone],
				borderStyle: tone === "idle" ? "dashed" : "solid",
			}}
		>
			<Box sx={topSx}>
				<Box component="span">{environment.label}</Box>
				<Box component="span" sx={glyphSx}>
					<ReleaseMark title={tooltip} color={releaseToneColors[tone]}>
						{glyph}
					</ReleaseMark>
				</Box>
			</Box>
			<ReleaseNodeFacts
				environment={environment}
				repo={repo}
				defaultBranch={defaultBranch}
			/>
		</Box>
	);
}
