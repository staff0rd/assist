import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";
import type { EditIssueParent } from "./resolveEditIssueParent";

export function editIssuePreviewMetadata(
	currentParent: string | undefined,
	parent: EditIssueParent | undefined,
): PreviewMetadata[] {
	if (!parent) return [];
	const { owner, repo, number } = parent.parent;
	return [
		{
			label: "Parent",
			value: `${currentParent ?? "none"} → ${parent.label}`,
			url: `https://github.com/${owner}/${repo}/issues/${number}`,
		},
	];
}
