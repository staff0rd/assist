import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";
import { buildCodexModelArgs } from "./buildCodexModelArgs";
import type { SpinnerHandle } from "./MultiSpinner";
import type { Harness } from "./ReviewerModels";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type SlotSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	spinner?: SpinnerHandle;
	override?: CodexModelOverride;
};

export function runSlot(
	harness: Harness,
	spec: SlotSpec,
): Promise<ReviewerResult> {
	if (harness === "claude") return runClaudeReviewer(spec);
	return runCodexReviewer({
		name: spec.name,
		stdin: spec.stdin,
		outputPath: spec.outputPath,
		spinner: spec.spinner,
		override: spec.override ?? buildCodexModelArgs(),
	});
}
