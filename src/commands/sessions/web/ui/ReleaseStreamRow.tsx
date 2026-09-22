import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReleaseStreamState } from "../releases/types";
import { ReleaseEnvironmentNode } from "./ReleaseEnvironmentNode";

const streamSx = { display: "flex", alignItems: "stretch" } as const;

const railSx = {
	flex: "0 0 200px",
	borderRight: 1,
	borderColor: "divider",
	px: 1.5,
	py: 1,
} as const;

const bodySx = {
	flex: "1 1 auto",
	minWidth: 0,
	display: "flex",
	alignItems: "center",
	gap: 2,
	overflowX: "auto",
	p: 1.5,
} as const;

const metaSx = { fontFamily: "monospace", display: "block" } as const;

export function ReleaseStreamRow({ stream }: { stream: ReleaseStreamState }) {
	return (
		<Paper variant="outlined" sx={streamSx}>
			<Box sx={railSx}>
				<Typography variant="subtitle2">{stream.name}</Typography>
				<Typography variant="caption" color="text.secondary" sx={metaSx}>
					{stream.repo}
				</Typography>
				<Typography variant="caption" color="text.secondary" sx={metaSx}>
					{stream.workflow}
				</Typography>
			</Box>
			<Box sx={bodySx}>
				{stream.error ? (
					<Alert severity="warning" variant="outlined" sx={{ flex: 1 }}>
						{stream.error}
					</Alert>
				) : stream.environments.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						No environment nodes declared.
					</Typography>
				) : (
					stream.environments.map((environment) => (
						<ReleaseEnvironmentNode
							key={environment.id}
							environment={environment}
							repo={stream.repo}
							defaultBranch={stream.defaultBranch}
						/>
					))
				)}
			</Box>
		</Paper>
	);
}
