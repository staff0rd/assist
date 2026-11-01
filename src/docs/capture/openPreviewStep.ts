import { renderProposedItem } from "../../commands/backlog/propose/renderProposedItem";
import { buildPrBody } from "../../commands/prs/buildPrBody";
import type { CaptureSetupStep } from "../captureSetupStepSchema";
import { buildHighLevelCapturePreview } from "./buildHighLevelCapturePreview";
import type { CaptureHome } from "./createCaptureHome";
import { holdPreviewOpen } from "./holdPreviewOpen";

export async function openPreviewStep(
	capture: CaptureHome,
	step: CaptureSetupStep,
): Promise<boolean> {
	if ("preview" in step) {
		const { session, kind, title, body } = step.preview;
		await holdPreviewOpen(capture, session, {
			kind,
			title,
			body,
			prNumber: null,
		});
	} else if ("question" in step) {
		const { session, title, questions } = step.question;
		await holdPreviewOpen(capture, session, {
			kind: "question",
			title,
			body: JSON.stringify({ questions }),
			prNumber: null,
		});
	} else if ("pr" in step) {
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
