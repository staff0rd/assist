import { randomBytes } from "node:crypto";

export function instanceProjectName(
	repo: string,
	prNumber: number,
	suffix: string = randomBytes(3).toString("hex"),
): string {
	const slug = repo
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `assist-review-${slug || "repo"}-pr${prNumber}-${suffix}`;
}
