import { checkReviewCi } from "./checkReviewCi";
import { promptReviewCiEnv } from "./promptReviewCiEnv";
import { readFlags } from "./readFlags";
import { setRepoConfig } from "./setRepoConfig";

export async function reviewCiInit(): Promise<void> {
	const flags = readFlags(process.argv.slice(2));
	const values = await promptReviewCiEnv(flags.values, process.env);

	if (flags.skipCheck) {
		console.log("Skipping the check that the config can reach every model.");
	} else {
		console.log("Checking the config can reach every model...");
		const errors = await checkReviewCi(values);
		if (errors.length > 0) {
			for (const error of errors) console.error(`review-ci: ${error}`);
			console.error("review-ci: nothing was set on the repo");
			process.exit(1);
		}
	}

	setRepoConfig(values);
	console.log("review-ci: repo variables are set");
}

try {
	await reviewCiInit();
} catch (error) {
	console.error(
		`review-ci: ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
}
