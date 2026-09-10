import { useCallback, useRef, useState } from "react";
import { UploadImageError, uploadPreviewImage } from "./uploadPreviewImage";
import { useImageDropPaste } from "./useImageDropPaste";

export type UploadError = { message: string; command?: string };

export type ScreenshotUpload = { id: number; error?: UploadError };

function toUploadError(error: unknown): UploadError {
	if (error instanceof UploadImageError)
		return { message: error.message, command: error.command };
	return {
		message: error instanceof Error ? error.message : "Failed to upload image",
	};
}

export function useScreenshotUpload(
	cwd: string | undefined,
	onUploaded: (screenshot: {
		markdown: string;
		url: string;
		contentType: string;
	}) => void,
	enabled: boolean,
) {
	const [uploads, setUploads] = useState<ScreenshotUpload[]>([]);
	const nextId = useRef(0);

	const upload = useCallback(
		async (file: File) => {
			const id = nextId.current++;
			setUploads((us) => [...us.filter((u) => !u.error), { id }]);
			try {
				const markdown = await uploadPreviewImage(file, cwd);
				onUploaded({
					markdown,
					url: URL.createObjectURL(file),
					contentType: file.type,
				});
				setUploads((us) => us.filter((u) => u.id !== id));
			} catch (error) {
				const failure = toUploadError(error);
				setUploads((us) =>
					us.map((u) => (u.id === id ? { id, error: failure } : u)),
				);
			}
		},
		[cwd, onUploaded],
	);

	const { onDrop, onDragOver } = useImageDropPaste(upload, enabled);

	return { uploads, onDrop, onDragOver };
}
