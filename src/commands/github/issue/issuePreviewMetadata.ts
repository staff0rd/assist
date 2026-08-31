import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";
import type { CreateIssueMetadata } from "./resolveCreateIssueMetadata";

export function issuePreviewMetadata(
	resolved: CreateIssueMetadata | undefined,
): PreviewMetadata[] {
	if (!resolved) return [];
	const { target, issueType, parent, project, labels } = resolved;
	const items: PreviewMetadata[] = [
		{ label: "Repository", value: `${target.owner}/${target.repo}` },
	];
	if (issueType) items.push({ label: "Type", value: issueType.name });
	if (parent)
		items.push({
			label: "Parent",
			value: `${parent.owner}/${parent.repo}#${parent.number}`,
		});
	if (project)
		items.push({
			label: "Project",
			value: `${project.number} (${project.title})`,
		});
	if (project?.status)
		items.push({ label: "Status", value: project.status.optionName });
	if (labels?.length) items.push({ label: "Labels", value: labels.join(", ") });
	return items;
}
