import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import type { PrPaneOptions } from "./PrPaneOptions";
import { previewPaneCapabilities } from "../previewPaneCapabilities";
import { previewScreenshotScope } from "./previewPaneOptions/previewScreenshotScope";

export function previewPaneOptions(
	preview: PrPreview,
	sessionId: string | undefined,
	cwd: string | undefined,
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void,
): PrPaneOptions {
	return {
		...previewPaneCapabilities(preview.kind),
		requestId: preview.requestId,
		sessionId,
		cwd,
		onDecision,
		screenshotScope: previewScreenshotScope(sessionId, preview.kind),
		seededScreenshots: preview.screenshots ?? [],
		resolvedDraft: preview.draft === true,
		initialBody: preview.body,
	};
}
