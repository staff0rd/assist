import { findRepoRoot } from "../../shared/findRepoRoot";
import { reviewPr } from "./reviewPr";
import { reviewSha } from "./reviewSha";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	verbose?: boolean;
	sha?: string;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

function rejectShaFlag(flag: string): void {
	console.error(`Error: ${flag} cannot be combined with a SHA argument.`);
	process.exit(1);
}

function validateOptions(options: ReviewOptions): void {
	if (options.apply && options.refine) {
		console.error("Error: --apply cannot be combined with --refine.");
		process.exit(1);
	}
	if (!options.sha) return;
	if (options.refine) rejectShaFlag("--refine");
	if (options.apply) rejectShaFlag("--apply");
	if (options.submit) rejectShaFlag("--submit");
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateOptions(options);
	const repoRoot = resolveRepoRoot();
	if (options.sha) {
		await reviewSha(repoRoot, {
			sha: options.sha,
			force: options.force,
			verbose: options.verbose,
		});
		return;
	}
	await reviewPr(repoRoot, options);
}
