import { useScreenshots } from "../useScreenshots";
import { useScreenshotUpload } from "../useScreenshotUpload";

export function usePaneScreenshots(
	cwd: string | undefined,
	enabled: boolean,
	scope: string | undefined,
) {
	const { screenshots, add, remove, clearPersisted } = useScreenshots(
		enabled ? scope : undefined,
		cwd,
	);
	const { uploads, onDrop, onDragOver } = useScreenshotUpload(
		cwd,
		add,
		enabled,
	);

	return {
		screenshots,
		removeScreenshot: remove,
		decision: {
			markdown: () => screenshots.map((s) => s.markdown),
			clearPersisted,
		},
		uploads,
		onDrop,
		onDragOver,
	};
}
