import LaunchIcon from "@mui/icons-material/Launch";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { repoLabel } from "./repoLabel";
import type { SessionInfo } from "./types";

const bannerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	mb: 0.5,
	px: "6px",
	py: 0.25,
	borderRadius: 1,
	border: 1,
	borderColor: "success.main",
	bgcolor: "success.dark",
} as const;

const labelSx = {
	flex: 1,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	color: "success.contrastText",
} as const;

export function RemoteServingBanner({
	serving,
	onJump,
}: {
	serving: SessionInfo;
	onJump: () => void;
}) {
	const where = serving.port ? `serving :${serving.port}` : "serving";
	const repo = repoLabel(serving.cwd);
	const label = repo
		? `${where} · ${repo} · ${serving.name}`
		: `${where} · ${serving.name}`;
	return (
		<Box sx={bannerSx}>
			<Typography variant="caption" title={label} sx={labelSx}>
				{label}
			</Typography>
			<Button
				size="small"
				startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					onJump();
				}}
				sx={{ color: "success.contrastText", minWidth: 0 }}
			>
				Jump
			</Button>
		</Box>
	);
}
