import type { PreviewDecision } from "./PreviewDecision";

export type AutoAnsweredBy = "yolo" | "autopilot";

export function autoAnsweredBy(
	decision: PreviewDecision,
): AutoAnsweredBy | undefined {
	if (decision.autopilot) return "autopilot";
	if (decision.yolo) return "yolo";
	return undefined;
}
