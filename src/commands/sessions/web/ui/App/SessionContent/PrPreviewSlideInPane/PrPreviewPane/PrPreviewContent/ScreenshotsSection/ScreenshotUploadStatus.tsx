import { CircularProgress, Stack, Typography } from "@mui/material";
import type { ScreenshotUpload } from "../../useScreenshotUpload";

function UploadingRow() {
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
			<CircularProgress size={16} />
			<Typography variant="caption" color="text.secondary">
				Attaching screenshot or video…
			</Typography>
		</Stack>
	);
}

function UploadErrorRow({ error }: { error: string }) {
	return (
		<Typography
			variant="caption"
			color="error"
			sx={{ wordBreak: "break-word" }}
		>
			{error}
		</Typography>
	);
}

export function ScreenshotUploadStatus({
	uploads,
	empty,
}: {
	uploads: ScreenshotUpload[];
	empty: boolean;
}) {
	if (uploads.length > 0)
		return (
			<>
				{uploads.map((upload) =>
					upload.error ? (
						<UploadErrorRow key={upload.id} error={upload.error} />
					) : (
						<UploadingRow key={upload.id} />
					),
				)}
			</>
		);

	if (empty)
		return (
			<Typography variant="caption" color="text.secondary">
				Drop or paste an image or video to attach
			</Typography>
		);

	return null;
}
