import { execFileSync } from "node:child_process";
import { emitActivity } from "../../shared/emitActivity";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { reviewPr } from "./reviewPr";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	backlog?: boolean;
	verbose?: boolean;
	number?: string;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

function validateOptions(options: ReviewOptions): void {
	if (options.apply && options.refine) {
		console.error("Error: --apply cannot be combined with --refine.");
		process.exit(1);
	}
	if (options.backlog && (options.refine || options.apply)) {
		console.error(
			"Error: --backlog cannot be combined with --refine or --apply.",
		);
		process.exit(1);
	}
}

function checkoutPr(number: string): void {
	try {
		execFileSync("gh", ["pr", "checkout", number], { stdio: "inherit" });
	} catch {
		console.error(`gh pr checkout ${number} failed; aborting.`);
		process.exit(1);
	}
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateOptions(options);
	const repoRoot = resolveRepoRoot();
	emitActivity({ kind: "command", name: "review" });
	if (options.number) checkoutPr(options.number);
	await reviewPr(repoRoot, options);
}
