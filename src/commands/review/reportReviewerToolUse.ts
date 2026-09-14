import { formatToolText } from "./formatToolText";
import type { SpinnerHandle } from "./MultiSpinner";
import { reviewerLabel } from "./reviewerLabel";

type ToolUse = { tool: string; summary: string };

export function reportReviewerToolUse(
	name: string,
	use: ToolUse,
	spinner: SpinnerHandle | undefined,
	model?: string,
): void {
	const label = reviewerLabel(name, model);
	if (spinner) {
		spinner.text = formatToolText(label, use.tool, use.summary);
		return;
	}
	const suffix = use.summary ? `: ${use.summary}` : "";
	console.log(`[${label}] ${use.tool}${suffix}`);
}
