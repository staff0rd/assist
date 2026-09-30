import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export function NextItemActions({
	url,
	onStart,
	size = "small",
}: {
	url: string;
	onStart: () => void;
	size?: "small" | "medium";
}) {
	return (
		<Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
			<Button
				variant="outlined"
				size={size}
				startIcon={<PlayArrowIcon />}
				onClick={onStart}
			>
				Start session
			</Button>
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
