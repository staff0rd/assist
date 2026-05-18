import type { MultiSpinner } from "./MultiSpinner";
import { runClaudeReviewer } from "./runClaudeReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type Args = {
	reviewDir: string;
	claudePath: string;
	stdin: string;
	cached: ReviewerResult | null;
	multi: MultiSpinner | undefined;
};

export function resolveClaude(args: Args): Promise<ReviewerResult> {
	if (args.cached) return Promise.resolve(args.cached);
	const spinner = args.multi?.create("claude — starting");
	return runClaudeReviewer({
		name: "claude",
		reviewDir: args.reviewDir,
		stdin: args.stdin,
		outputPath: args.claudePath,
		spinner,
	});
}
