import { addIssueToProject } from "./addIssueToProject";
import { addSubIssue } from "./addSubIssue";
import { fetchIssueNodeId } from "./fetchIssueNodeId";
import { updateIssueType } from "./fixStructure/updateIssueType";
import { parseCreatedIssueUrl } from "./parseCreatedIssueUrl";
import type { CreateIssueMetadata } from "./resolveCreateIssueMetadata";
import { setProjectItemStatus } from "./setProjectItemStatus";

export function applyCreatedIssueMetadata(
	createOutput: string,
	metadata: CreateIssueMetadata,
): void {
	let step = "identifying the created issue";
	try {
		const issueId = fetchIssueNodeId(parseCreatedIssueUrl(createOutput));
		const { issueType, parent, project } = metadata;
		if (issueType) {
			step = `setting its issue type to ${issueType.name}`;
			updateIssueType(issueId, issueType.id);
		}
		if (parent) {
			step = `adding it as a sub-issue of ${parent.owner}/${parent.repo}#${parent.number}`;
			addSubIssue(parent.id, issueId);
		}
		if (project) {
			step = `adding it to project ${project.number} (${project.title})`;
			const itemId = addIssueToProject(project.id, issueId);
			if (project.status) {
				step = `setting its status to ${project.status.optionName}`;
				setProjectItemStatus({
					projectId: project.id,
					itemId,
					fieldId: project.status.fieldId,
					optionId: project.status.optionId,
				});
			}
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			`The issue was created at ${createOutput.trim()}, but ${step} failed: ${message}`,
		);
		process.exit(1);
	}
}
