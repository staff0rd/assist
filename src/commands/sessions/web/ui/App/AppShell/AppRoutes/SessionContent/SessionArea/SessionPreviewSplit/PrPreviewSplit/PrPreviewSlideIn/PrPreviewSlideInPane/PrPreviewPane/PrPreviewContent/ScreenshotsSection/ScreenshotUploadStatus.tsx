import { CircularProgress, Stack, Typography } from "@mui/material";
import { CopyButton } from "./ScreenshotUploadStatus/CopyButton";
import type { ScreenshotUpload, UploadError } from "../../useScreenshotUpload";

function UploadingRow() {
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
			<CircularProgress size={16} />
			<Typography variant="caption" color="text.secondary">
				Uploading screenshot or video…
			</Typography>
		</Stack>
	);
}

function UploadErrorRow({ error }: { error: UploadError }) {
	return (
		<Stack direction="row" spacing={0.5} sx={{ alignItems: "flex-start" }}>
			<Typography
				variant="caption"
				color="error"
				sx={{ flex: 1, wordBreak: "break-word" }}
			>
				{error.message}
			</Typography>
			{error.command && (
				<CopyButton text={error.command} label="Copy install command" />
			)}
		</Stack>
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
