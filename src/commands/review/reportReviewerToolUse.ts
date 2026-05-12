import { formatToolText } from "./formatToolText";
import type { SpinnerHandle } from "./MultiSpinner";

type ToolUse = { tool: string; summary: string };

export function reportReviewerToolUse(
	name: string,
	use: ToolUse,
	spinner: SpinnerHandle | undefined,
): void {
	if (spinner) {
		spinner.text = formatToolText(name, use.tool, use.summary);
		return;
	}
	const suffix = use.summary ? `: ${use.summary}` : "";
	console.log(`[${name}] ${use.tool}${suffix}`);
}
