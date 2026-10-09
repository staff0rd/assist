import { Box, Stack } from "@mui/material";
import { groupScreenshots } from "./ScreenshotsSection/groupScreenshots";
import { ScreenshotThumbnail } from "./ScreenshotsSection/ScreenshotThumbnail";
import { ScreenshotUploadStatus } from "./ScreenshotsSection/ScreenshotUploadStatus";
import type { LocalScreenshot } from "../useScreenshots";
import type { ScreenshotUpload } from "../useScreenshotUpload";

const groupGridSx = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 1,
} as const;

export function ScreenshotsSection({
	screenshots,
	uploads,
	onRemove,
}: {
	screenshots: LocalScreenshot[];
	uploads: ScreenshotUpload[];
	onRemove: (id: number) => void;
}) {
	const { groups, ungrouped } = groupScreenshots(screenshots);
	const thumbnail = (s: LocalScreenshot) => (
		<ScreenshotThumbnail key={s.id} screenshot={s} onRemove={onRemove} />
	);
	return (
		<Box sx={{ mt: 3 }}>
			{screenshots.length > 0 && <Box component="h2">Screenshots</Box>}
			{groups.map(([group, members]) => (
				<Box key={group} sx={{ mb: 2 }}>
					<Box component="h3">{group}</Box>
					<Box sx={groupGridSx}>{members.map(thumbnail)}</Box>
				</Box>
			))}
			<Stack spacing={1}>
				{ungrouped.map(thumbnail)}
				<ScreenshotUploadStatus
					uploads={uploads}
					empty={screenshots.length === 0}
				/>
			</Stack>
		</Box>
	);
}
