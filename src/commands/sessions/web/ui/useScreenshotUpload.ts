import { useCallback, useState } from "react";
import { UploadImageError, uploadPreviewImage } from "./uploadPreviewImage";
import { useImageDropPaste } from "./useImageDropPaste";

export type UploadError = { message: string; command?: string };

export function useScreenshotUpload(
	cwd: string | undefined,
	onUploaded: (screenshot: { markdown: string; url: string }) => void,
) {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<UploadError | null>(null);

	const upload = useCallback(
		async (file: File) => {
			setUploading(true);
			setError(null);
			try {
				const markdown = await uploadPreviewImage(file, cwd);
				onUploaded({ markdown, url: URL.createObjectURL(file) });
			} catch (error) {
				if (error instanceof UploadImageError)
					setError({ message: error.message, command: error.command });
				else
					setError({
						message:
							error instanceof Error ? error.message : "Failed to upload image",
					});
			} finally {
				setUploading(false);
			}
		},
		[cwd, onUploaded],
	);

	const { onDrop, onDragOver } = useImageDropPaste(upload);

	return { uploading, error, onDrop, onDragOver };
}
