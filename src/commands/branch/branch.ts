import { createBranch } from "./createBranch";
import { isConciseSlug } from "./deriveBranchSlug";
import { generateBranchSlug } from "./generateBranchSlug";
import { validateSlug } from "./validateSlug";

export async function branch(
	slug: string,
	options: { jira?: string; from?: string },
): Promise<void> {
	const conciseSlug = isConciseSlug(slug)
		? slug
		: await generateBranchSlug(slug);
	if (conciseSlug !== slug) {
		console.log(`Shortened "${slug}" to "${conciseSlug}"`);
	}

	const slugError = validateSlug(conciseSlug);
	if (slugError) {
		console.error(`Error: ${slugError}`);
		process.exit(1);
	}

	try {
		const { branchName, baseRef } = await createBranch({
			slug: conciseSlug,
			jira: options.jira,
			from: options.from,
		});
		console.log(`Created and switched to ${branchName} (from ${baseRef})`);
		process.exit(0);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}
