import { displayStatus } from "../../displayStatus";
import type { SessionInfo } from "../../types";

type NeedsYouChip = { label: string; color: "warning" | "check" };

const PREVIEW_LABELS: Record<string, string> = {
	ask: "Plan",
	design: "Design",
	pr: "Review",
	"high-level-review": "Review",
	"slack-post": "Review",
	"miro-board": "Review",
	rule: "Review",
};

export function needsYouChip(session: SessionInfo): NeedsYouChip {
	const status = displayStatus(session);
	if (status === "check") return { label: "Check", color: "check" };
	if (status === "question") return { label: "Question", color: "warning" };
	const kind = session.pendingPrPreview?.kind;
	return {
		label: (kind && PREVIEW_LABELS[kind]) ?? "Waiting",
		color: "warning",
	};
}
