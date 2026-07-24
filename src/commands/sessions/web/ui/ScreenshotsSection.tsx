import { Box, Stack } from "@mui/material";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";
import { ScreenshotUploadStatus } from "./ScreenshotUploadStatus";
import type { LocalScreenshot } from "./useScreenshots";
import type { UploadError } from "./useScreenshotUpload";

export function ScreenshotsSection({
	screenshots,
	uploading,
	error,
	onRemove,
}: {
	screenshots: LocalScreenshot[];
	uploading: boolean;
	error: UploadError | null;
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
					uploading={uploading}
					error={error}
					empty={screenshots.length === 0}
				/>
			</Stack>
		</Box>
	);
}
