import { PreviewBody } from "./PreviewBody";
import { ScreenshotsSection } from "./ScreenshotsSection";
import type { usePrPane } from "./usePrPane";

export function PrPreviewContent({
	body,
	pane,
}: {
	body: string;
	pane: ReturnType<typeof usePrPane>;
}) {
	return (
		<PreviewBody
			content={body}
			ranges={pane.ranges}
			wrapperRef={pane.wrapperRef}
			contentRef={pane.contentRef}
			dragRects={pane.dragRects}
			dragColor={pane.dragColor}
			onMouseDown={pane.onMouseDown}
			footer={
				<ScreenshotsSection
					screenshots={pane.screenshots}
					uploading={pane.uploading}
					error={pane.uploadError}
					onRemove={pane.removeScreenshot}
				/>
			}
		/>
	);
}
