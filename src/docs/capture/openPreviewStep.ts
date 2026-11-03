import { renderProposedItem } from "../../commands/backlog/propose/renderProposedItem";
import { buildPrBody } from "../../commands/prs/buildPrBody";
import type { CaptureSetupStep } from "../captureSetupStepSchema";
import { buildHighLevelCapturePreview } from "./buildHighLevelCapturePreview";
import type { CaptureHome } from "./createCaptureHome";
import { holdPreviewOpen } from "./holdPreviewOpen";
import { openAskPreviewStep } from "./openAskPreviewStep";

export async function openPreviewStep(
	capture: CaptureHome,
	step: CaptureSetupStep,
): Promise<boolean> {
	if (await openAskPreviewStep(capture, step)) return true;
	if ("pr" in step) {
		const { session, title, prNumber, draft, ...sections } = step.pr;
		await holdPreviewOpen(capture, session, {
			title,
			body: buildPrBody(sections),
			prNumber: prNumber ?? null,
			draft: draft === true,
		});
	} else if ("proposal" in step) {
		const { session, item } = step.proposal;
		await holdPreviewOpen(capture, session, {
			kind: "backlog-item",
			title: item.name,
			body: renderProposedItem(item),
			prNumber: null,
			itemType: item.type,
			canStart: true,
		});
	} else if ("highLevelReview" in step) {
		await holdPreviewOpen(
			capture,
			step.highLevelReview.session,
			buildHighLevelCapturePreview(step.highLevelReview),
		);
	} else return false;
	return true;
}
