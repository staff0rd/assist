import { AcceptanceCriteriaOutline } from "../../../../../../../../../../AcceptanceCriteriaOutline";
import { CriteriaSectionButton } from "../../../../../../../../../../CriteriaSectionButton";
import { PreviewBody } from "./PrPreviewContent/PreviewBody";
import { ScreenshotsSection } from "./PrPreviewContent/ScreenshotsSection";
import type { usePrPane } from "./usePrPane";

function criteriaParts(pane: ReturnType<typeof usePrPane>) {
	const criteria = pane.criteria;
	if (!criteria) return { content: pane.body };
	const parts = { content: criteria.before, trailing: criteria.after };
	if (criteria.kind === "outline")
		return {
			...parts,
			control: (
				<AcceptanceCriteriaOutline
					items={criteria.items}
					onChange={pane.onCriteriaChange}
				/>
			),
		};
	return {
		...parts,
		control: (
			<CriteriaSectionButton
				kind={criteria.kind}
				onClick={
					criteria.kind === "insert"
						? pane.onCriteriaInsert
						: pane.onCriteriaConvert
				}
			/>
		),
	};
}

export function PrPreviewContent({
	pane,
	screenshots,
}: {
	pane: ReturnType<typeof usePrPane>;
	screenshots: boolean;
}) {
	return (
		<PreviewBody
			{...criteriaParts(pane)}
			ranges={pane.ranges}
			wrapperRef={pane.wrapperRef}
			contentRef={pane.contentRef}
			dragRects={pane.dragRects}
			dragColor={pane.dragColor}
			onMouseDown={pane.onMouseDown}
			footer={
				screenshots ? (
					<ScreenshotsSection
						screenshots={pane.screenshots}
						uploads={pane.uploads}
						onRemove={pane.removeScreenshot}
					/>
				) : undefined
			}
		/>
	);
}
