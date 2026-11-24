import { readBodyArgument } from "../../prs/readBodyArgument";
import { validateIssueBody } from "./validateIssueBody";

export async function readProposedIssueBody(
	title: string | undefined,
	body: string | undefined,
): Promise<string | undefined> {
	if (title !== undefined) validateIssueBody(title, "");
	return body ? await readBodyArgument(body) : undefined;
}
