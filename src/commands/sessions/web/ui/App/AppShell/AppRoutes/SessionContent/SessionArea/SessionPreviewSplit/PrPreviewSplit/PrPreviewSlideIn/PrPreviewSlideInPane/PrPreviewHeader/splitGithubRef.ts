import { githubIssueUrl } from "../../../../../../../../../../../../../../shared/githubIssueUrl";

type TitleWithRef = {
	before: string;
	reference: string;
	url: string;
	after: string;
};

const IN_TITLE = /[^\s/]+\/[^\s/#]+#\d+/;

export function splitGithubRef(title: string): TitleWithRef | null {
	const match = IN_TITLE.exec(title);
	if (!match) return null;
	const url = githubIssueUrl(match[0]);
	if (!url) return null;
	return {
		before: title.slice(0, match.index),
		reference: match[0],
		url,
		after: title.slice(match.index + match[0].length),
	};
}
