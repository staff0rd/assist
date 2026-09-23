import { addSubIssue } from "./addSubIssue";
import { fetchIssueNodeId } from "./fetchIssueNodeId";
import { resolveCreateIssueParent } from "./resolveCreateIssueParent";
import { resolveIssueRepoTarget } from "./resolveIssueRepoTarget";

export function setIssueParent(
	number: number,
	repo: string | undefined,
	parentArg: string,
): void {
	const target = resolveIssueRepoTarget(repo);
	const child = `${target.owner}/${target.repo}#${number}`;
	try {
		const childId = fetchIssueNodeId({ ...target, number });
		const parent = resolveCreateIssueParent(target, parentArg);
		addSubIssue(parent.id, childId);
		console.log(
			`${child} is now a sub-issue of ${parent.owner}/${parent.repo}#${parent.number}`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Setting the parent of ${child} failed: ${message}`);
		process.exit(1);
	}
}
