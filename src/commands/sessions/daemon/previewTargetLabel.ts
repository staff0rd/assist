import type { PreviewItemType, PreviewKind } from "../shared/SessionInfoBase";

export function previewTargetLabel(
	kind: PreviewKind,
	itemType: PreviewItemType,
	prNumber: number | null,
	draft: boolean,
): string {
	if (kind === "backlog-comment") return "backlog comment";
	if (kind === "pr-comment") return "pr comment";
	if (kind === "github-issue-comment") return "github issue comment";
	if (kind === "github-issue-edit") return "github issue edit";
	if (kind === "github-issue") return "github issue";
	if (kind === "miro-board") return "miro anchors";
	if (kind === "slack-post") return "slack post";
	if (kind === "backlog-item") return `backlog ${itemType}`;
	if (prNumber !== null) return `edit #${prNumber}`;
	return draft ? "create draft" : "create";
}
