import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";
import type { CurrentIssueMetadata } from "./prepareIssueEdit";
import type { EditIssueMetadata } from "./resolveEditIssueMetadata";

export function editIssuePreviewMetadata(
	current: CurrentIssueMetadata,
	metadata: EditIssueMetadata | undefined,
): PreviewMetadata[] {
	const rows: PreviewMetadata[] = [];
	if (metadata?.issueType) {
		rows.push({
			label: "Type",
			value: `${current.issueType ?? "none"} → ${metadata.issueType.name}`,
		});
	}
	if (metadata?.parent) {
		const { owner, repo, number, label } = metadata.parent;
		rows.push({
			label: "Parent",
			value: `${current.parent ?? "none"} → ${label}`,
			url: `https://github.com/${owner}/${repo}/issues/${number}`,
		});
	}
	return rows;
}
