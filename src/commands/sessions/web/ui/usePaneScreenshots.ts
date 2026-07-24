import { useScreenshots } from "./useScreenshots";
import { useScreenshotUpload } from "./useScreenshotUpload";

export function usePaneScreenshots(cwd: string | undefined) {
	const { screenshots, add, remove } = useScreenshots();
	const { uploading, error, onDrop, onDragOver } = useScreenshotUpload(
		cwd,
		add,
	);

	return {
		screenshots,
		removeScreenshot: remove,
		uploading,
		uploadError: error,
		onDrop,
		onDragOver,
	};
}
