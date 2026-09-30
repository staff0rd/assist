import { checkReviewCi } from "./checkReviewCi";

export async function reviewCiCheck(): Promise<void> {
	const errors = await checkReviewCi(process.env);
	if (errors.length > 0) {
		for (const error of errors) console.error(`review-ci: ${error}`);
		process.exit(1);
	}
	console.log("review-ci: config is set and both models are reachable");
}

await reviewCiCheck();
