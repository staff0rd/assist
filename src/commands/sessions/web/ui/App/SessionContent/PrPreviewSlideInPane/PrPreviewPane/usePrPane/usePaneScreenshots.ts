import type { PrPaneOptions } from "../PrPaneOptions";
import { useScreenshots } from "../useScreenshots";
import { useScreenshotUpload } from "../useScreenshotUpload";

export function usePaneScreenshots({
	cwd,
	screenshots: enabled,
	screenshotScope,
	requestId,
	seededScreenshots,
}: PrPaneOptions) {
	const { screenshots, add, remove, clearPersisted } = useScreenshots(
		enabled ? screenshotScope : undefined,
		requestId,
		enabled ? seededScreenshots : [],
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
			attachments: () =>
				screenshots.map(({ path, alt, group }) =>
					group ? { path, alt, group } : { path, alt },
				),
			clearPersisted,
		},
		uploads,
		onDrop,
		onDragOver,
	};
}
