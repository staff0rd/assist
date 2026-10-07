import type { MultiSpinner } from "./MultiSpinner";
import type { SlotModel } from "./ReviewerModels";
import { reviewerLabel } from "./reviewerLabel";
import { runSlot } from "./runSlot";
import type { ReviewerResult } from "./runStreamingChild";

type Args = {
	reviewDir: string;
	claudePath: string;
	stdin: string;
	cached: ReviewerResult | null;
	multi: MultiSpinner | undefined;
	slot?: SlotModel;
};

export function resolveClaude(args: Args): Promise<ReviewerResult> {
	if (args.cached) return Promise.resolve(args.cached);
	const name = args.slot?.label ?? "claude";
	const override = args.slot?.override;
	const spinner = args.multi?.create(
		`${reviewerLabel(name, override?.model)} — starting`,
	);
	return runSlot(args.slot?.harness ?? "claude", {
		name,
		reviewDir: args.reviewDir,
		stdin: args.stdin,
		outputPath: args.claudePath,
		spinner,
		override,
	});
}
