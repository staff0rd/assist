import { fetchIssue } from "./fetchIssue";
import { resumeIssueBody } from "./resumeIssueBody";
import { validateIssueBody } from "./validateIssueBody";
import { writeIssueWorkingFile } from "./writeIssueWorkingFile";
import { slugFromUrl } from "./slugFromUrl";

type PreparedIssueEdit = {
	title: string;
	target: string;
	updatedAt: string;
	body: string;
	fetchedBody: string;
	bodyPath: string;
	save: (markdown: string) => string;
};

export function prepareIssueEdit(
	number: number,
	repo: string | undefined,
	fresh: boolean | undefined,
	proposed: string | undefined,
): PreparedIssueEdit {
	const issue = fetchIssue(number, repo);
	const slug = repo ?? slugFromUrl(issue.url);
	const target = `${slug}#${number}`;
	const resumed =
		proposed !== undefined || fresh
			? undefined
			: resumeIssueBody(slug, number, issue.updatedAt);
	const body = proposed ?? resumed ?? issue.body;
	validateIssueBody(issue.title, body);

	const save = (markdown: string) =>
		writeIssueWorkingFile(slug, number, target, issue.updatedAt, markdown);

	const bodyPath = save(body);
	if (resumed !== undefined)
		console.log(`Previewing the in-progress markdown from ${bodyPath}`);

	return {
		title: issue.title,
		target,
		updatedAt: issue.updatedAt,
		body,
		fetchedBody: issue.body,
		bodyPath,
		save,
	};
}
