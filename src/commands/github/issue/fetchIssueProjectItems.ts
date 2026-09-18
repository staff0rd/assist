import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";
import { parseIssueProjectItems } from "./parseIssueProjectItems";
import type { IssueProjectItem } from "./toIssueProjectItem";

const QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
	repository(owner: $owner, name: $repo) {
		issue(number: $number) {
			id
			projectItems(first: 20) {
				nodes {
					id
					project {
						id
						number
						title
						field(name: "Status") {
							... on ProjectV2SingleSelectField { id options { id name } }
						}
					}
				}
			}
		}
	}
}`;

export function fetchIssueProjectItems(target: {
	owner: string;
	repo: string;
	number: number;
}): { issueId: string; items: IssueProjectItem[] } {
	return parseIssueProjectItems(
		runGhGraphqlJson(QUERY, target),
		`${target.owner}/${target.repo}#${target.number}`,
	);
}
