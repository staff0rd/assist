import type { MultiSpinner } from "./MultiSpinner";
import { type CodexPlan, skippedCodexResult } from "./planCodexReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type Args = {
	codexPath: string;
	stdin: string;
	plan: CodexPlan;
	multi: MultiSpinner | undefined;
};

export function resolveCodex(args: Args): Promise<ReviewerResult> {
	if (args.plan.kind === "cached") return Promise.resolve(args.plan.cached);
	if (args.plan.kind === "skipped") {
		return Promise.resolve(skippedCodexResult(args.codexPath));
	}
	const spinner = args.multi?.create("codex — starting");
	return runCodexReviewer({
		name: "codex",
		stdin: args.stdin,
		outputPath: args.codexPath,
		spinner,
	});
}
