import { Box, Stack } from "@mui/material";
import { ScreenshotThumbnail } from "./ScreenshotsSection/ScreenshotThumbnail";
import { ScreenshotUploadStatus } from "./ScreenshotsSection/ScreenshotUploadStatus";
import type { LocalScreenshot } from "../useScreenshots";
import type { ScreenshotUpload } from "../useScreenshotUpload";

export function ScreenshotsSection({
	screenshots,
	uploads,
	onRemove,
}: {
	screenshots: LocalScreenshot[];
	uploads: ScreenshotUpload[];
	onRemove: (id: number) => void;
}) {
	return (
		<Box sx={{ mt: 3 }}>
			{screenshots.length > 0 && <Box component="h2">Screenshots</Box>}
			<Stack spacing={1}>
				{screenshots.map((s) => (
					<ScreenshotThumbnail key={s.id} screenshot={s} onRemove={onRemove} />
				))}
				<ScreenshotUploadStatus
					uploads={uploads}
					empty={screenshots.length === 0}
				/>
			</Stack>
		</Box>
	);
}
