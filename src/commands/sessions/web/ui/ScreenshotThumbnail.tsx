import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton } from "@mui/material";
import type { LocalScreenshot } from "./useScreenshots";

const imgSx = {
	display: "block",
	maxWidth: "100%",
	borderRadius: 1,
	border: 1,
	borderColor: "divider",
} as const;

const removeSx = {
	position: "absolute",
	top: 4,
	right: 4,
	bgcolor: "background.paper",
	"&:hover": { bgcolor: "background.paper" },
} as const;

export function ScreenshotThumbnail({
	screenshot,
	onRemove,
}: {
	screenshot: LocalScreenshot;
	onRemove: (id: number) => void;
}) {
	return (
		<Box sx={{ position: "relative" }}>
			<Box component="img" src={screenshot.url} alt="screenshot" sx={imgSx} />
			<IconButton
				size="small"
				aria-label="Remove screenshot"
				sx={removeSx}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={() => onRemove(screenshot.id)}
			>
				<CloseIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
