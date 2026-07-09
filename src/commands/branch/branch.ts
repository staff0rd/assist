import { createBranch } from "./createBranch";
import { validateSlug } from "./validateSlug";

export async function branch(
	slug: string,
	options: { jira?: string },
): Promise<void> {
	const slugError = validateSlug(slug);
	if (slugError) {
		console.error(`Error: ${slugError}`);
		process.exit(1);
	}

	try {
		const { branchName, defaultBranch } = await createBranch({
			slug,
			jira: options.jira,
		});
		console.log(
			`Created and switched to ${branchName} (from origin/${defaultBranch})`,
		);
		process.exit(0);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}
