import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { useNextClone } from "./useNextClone";

export function NextItemActions({
	repo,
	url,
	onStart,
	size = "small",
}: {
	repo: string;
	url: string;
	onStart: (cwd: string) => void;
	size?: "small" | "medium";
}) {
	const cwd = useNextClone()(repo);
	return (
		<Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
			<Tooltip
				title={cwd ? "" : `No local clone of ${repo} to start a session in`}
			>
				<span>
					<Button
						variant="outlined"
						size={size}
						startIcon={<PlayArrowIcon />}
						disabled={!cwd}
						onClick={() => cwd && onStart(cwd)}
					>
						Start session
					</Button>
				</span>
			</Tooltip>
			<Button
				variant="outlined"
				size={size}
				startIcon={<OpenInNewIcon />}
				href={url}
				target="_blank"
				rel="noopener noreferrer"
			>
				GitHub
			</Button>
		</Stack>
	);
}
