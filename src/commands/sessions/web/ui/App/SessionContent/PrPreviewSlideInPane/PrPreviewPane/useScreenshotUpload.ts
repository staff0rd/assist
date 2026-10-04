import { useCallback, useRef, useState } from "react";
import type { PreviewAttachment } from "../../../../../../shared/PreviewAttachment";
import { uploadPreviewImage } from "./useScreenshotUpload/uploadPreviewImage";
import { useImageDropPaste } from "./useScreenshotUpload/useImageDropPaste";
import { useApiNode } from "../../../../useApiNode";

export type ScreenshotUpload = { id: number; error?: string };

export function useScreenshotUpload(
	cwd: string | undefined,
	onUploaded: (
		screenshot: PreviewAttachment & { url: string; contentType: string },
	) => void,
	enabled: boolean,
) {
	const [uploads, setUploads] = useState<ScreenshotUpload[]>([]);
	const nextId = useRef(0);
	const node = useApiNode();

	const upload = useCallback(
		async (file: File) => {
			const id = nextId.current++;
			setUploads((us) => [...us.filter((u) => !u.error), { id }]);
			try {
				const staged = await uploadPreviewImage(file, cwd, node);
				onUploaded({
					...staged,
					url: URL.createObjectURL(file),
					contentType: file.type,
				});
				setUploads((us) => us.filter((u) => u.id !== id));
			} catch (error) {
				const failure =
					error instanceof Error ? error.message : "Failed to attach file";
				setUploads((us) =>
					us.map((u) => (u.id === id ? { id, error: failure } : u)),
				);
			}
		},
		[cwd, node, onUploaded],
	);

	const { onDrop, onDragOver } = useImageDropPaste(upload, enabled);

	return { uploads, onDrop, onDragOver };
}
