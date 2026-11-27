import { execFileSync } from "node:child_process";
import { isGhNotInstalled } from "./shared";

export function fetchReview(endpoint: string, reviewId: number) {
	try {
		const review = JSON.parse(
			execFileSync("gh", ["api", `${endpoint}/${reviewId}`], {
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
			}),
		) as { id: number; user: { login: string }; html_url: string };
		return {
			id: review.id,
			user: review.user.login,
			html_url: review.html_url,
		};
	} catch (error) {
		if (isGhNotInstalled(error)) throw error;
		return fail(`review ${reviewId} was not found on this pull request.`);
	}
}

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}
