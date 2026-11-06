import type { CaptureSetupStep } from "../captureSetupStepSchema";
import { buildCheckPreview } from "./buildCheckPreview";
import type { CaptureHome } from "./createCaptureHome";
import { holdPreviewOpen } from "./holdPreviewOpen";

export async function openAskPreviewStep(
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
	} else if ("design" in step) {
		const { session, url, title, body } = step.design;
		await holdPreviewOpen(capture, session, {
			kind: "design",
			title,
			body,
			prNumber: null,
			metadata: [{ label: "Design", value: url, url }],
		});
	} else if ("question" in step) {
		const { session, title, questions } = step.question;
		await holdPreviewOpen(capture, session, {
			kind: "question",
			title,
			body: JSON.stringify({ questions }),
			prNumber: null,
		});
	} else if ("check" in step) {
		const { session, ...check } = step.check;
		await holdPreviewOpen(capture, session, buildCheckPreview(check));
	} else return false;
	return true;
}
