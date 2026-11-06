import { isGhGraphqlIssueMutation } from "./isGhGraphqlIssueMutation";
import { isGhRestWrite } from "./isGhRestWrite";

const ISSUE_ENDPOINT = /repos\/[^/\s"'`]+\/[^/\s"'`]+\/issues(?:$|[/?\s"'`)])/;

export function isGhIssueApiWrite(command: string): boolean {
	if (!/gh\s+api/.test(command)) return false;
	if (isGhRestWrite(command, ISSUE_ENDPOINT)) return true;
	return isGhGraphqlIssueMutation(command);
}
