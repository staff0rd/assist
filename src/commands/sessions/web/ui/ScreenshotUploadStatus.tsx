import { CircularProgress, Stack, Typography } from "@mui/material";
import { CopyButton } from "./CopyButton";
import type { UploadError } from "./useScreenshotUpload";

export function ScreenshotUploadStatus({
	uploading,
	error,
	empty,
}: {
	uploading: boolean;
	error: UploadError | null;
	empty: boolean;
}) {
	if (uploading)
		return (
			<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
				<CircularProgress size={16} />
				<Typography variant="caption" color="text.secondary">
					Uploading screenshot…
				</Typography>
			</Stack>
		);

	if (error)
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

	if (empty)
		return (
			<Typography variant="caption" color="text.secondary">
				Drop or paste an image to attach a screenshot
			</Typography>
		);

	return null;
}
