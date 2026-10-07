import { buildCodexModelArgs } from "./buildCodexModelArgs";
import type { MultiSpinner } from "./MultiSpinner";
import { type CodexPlan, skippedCodexResult } from "./planCodexReviewer";
import type { SlotModel } from "./ReviewerModels";
import { reviewerLabel } from "./reviewerLabel";
import { runSlot } from "./runSlot";
import type { ReviewerResult } from "./runStreamingChild";

type Args = {
	reviewDir: string;
	codexPath: string;
	stdin: string;
	plan: CodexPlan;
	multi: MultiSpinner | undefined;
	slot?: SlotModel;
};

export function resolveCodex(args: Args): Promise<ReviewerResult> {
	if (args.plan.kind === "cached") return Promise.resolve(args.plan.cached);
	if (args.plan.kind === "skipped") {
		return Promise.resolve(skippedCodexResult(args.codexPath));
	}
	const override = args.slot?.override ?? buildCodexModelArgs();
	const spinner = args.multi?.create(
		`${reviewerLabel("codex", override.model)} — starting`,
	);
	return runSlot(args.slot?.harness ?? "codex", {
		name: "codex",
		reviewDir: args.reviewDir,
		stdin: args.stdin,
		outputPath: args.codexPath,
		spinner,
		override,
	});
}
