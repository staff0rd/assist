import { ghJson } from "../releases/ghJson";
import { pickupsQuery } from "./pickupsQuery";
import type { GhProjectItemNode } from "./types";

type ProjectPageResponse = {
	data?: {
		repositoryOwner?: {
			projectV2?: {
				title?: string;
				url?: string;
				items?: {
					pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
					nodes?: (GhProjectItemNode | null)[];
				} | null;
			} | null;
		} | null;
	};
	errors?: { message?: string }[];
};

export function readProjectPage(
	cwd: string,
	owner: string,
	number: string,
	after: string | null,
): Promise<ProjectPageResponse> {
	return ghJson<ProjectPageResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${pickupsQuery}`,
		"-F",
		`owner=${owner}`,
		"-F",
		`number=${number}`,
		...(after ? ["-f", `after=${after}`] : []),
	]);
}
