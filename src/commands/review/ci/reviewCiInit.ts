import { checkReviewCi } from "./checkReviewCi";
import { promptReviewCiEnv } from "./promptReviewCiEnv";
import { setRepoConfig } from "./setRepoConfig";

export async function reviewCiInit(): Promise<void> {
	const values = await promptReviewCiEnv(process.argv.slice(2), process.env);

	console.log("Checking the config can reach both models...");
	const errors = await checkReviewCi(values);
	if (errors.length > 0) {
		for (const error of errors) console.error(`review-ci: ${error}`);
		console.error("review-ci: nothing was set on the repo");
		process.exit(1);
	}

	setRepoConfig(values);
	console.log("review-ci: repo variables and secret are set");
}

try {
	await reviewCiInit();
} catch (error) {
	console.error(
		`review-ci: ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
}
