import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";

const MUTATION = `mutation($issueId: ID!, $subIssueId: ID!) {
	addSubIssue(input: { issueId: $issueId, subIssueId: $subIssueId }) {
		subIssue { id }
	}
}`;

export function addSubIssue(parentId: string, childId: string): void {
	runGhGraphqlJson(MUTATION, { issueId: parentId, subIssueId: childId });
}
