import LaunchIcon from "@mui/icons-material/Launch";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { PortLink } from "../../../../../PortLink";
import { repoLabel } from "../../../../../../repoLabel";
import type { SessionInfo } from "../../../../../../../types";

const bannerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	px: "10px",
	py: 0.25,
	borderRadius: 0,
	borderLeft: 2,
	borderLeftColor: "success.main",
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
	const repo = repoLabel(serving.cwd);
	const rest = repo ? ` · ${repo} · ${serving.name}` : ` · ${serving.name}`;
	const title = `${serving.port ? `serving :${serving.port}` : "serving"}${rest}`;
	return (
		<Box sx={bannerSx}>
			<Typography variant="caption" title={title} sx={labelSx}>
				serving
				{serving.port ? (
					<>
						{" "}
						<PortLink port={serving.port} />
					</>
				) : null}
				{rest}
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
