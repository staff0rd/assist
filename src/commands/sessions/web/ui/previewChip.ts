import type { PrPreview } from "../../shared/SessionInfoBase";

type ChipSpec = {
	label: string;
	color: "success" | "info" | "warning" | "default";
};

export function previewChip(preview: PrPreview, draft: boolean): ChipSpec {
	if (
		preview.kind === "backlog-comment" ||
		preview.kind === "pr-comment" ||
		preview.kind === "github-issue-comment"
	)
		return { label: "Comment", color: "default" };

	if (preview.kind === "github-issue-edit")
		return { label: "Edit issue", color: "warning" };

	if (preview.kind === "miro-board")
		return { label: "Miro boxes", color: "info" };

	if (preview.kind === "slack-post")
		return { label: "Slack post", color: "success" };

	if (preview.kind === "github-issue")
		return { label: "New issue", color: "success" };

	if (preview.kind === "backlog-item")
		return preview.itemType === "bug"
			? { label: "Bug", color: "warning" }
			: { label: "Story", color: "info" };

	if (preview.prNumber !== null)
		return { label: `Update #${preview.prNumber}`, color: "info" };

	return draft
		? { label: "New draft PR", color: "success" }
		: { label: "New PR", color: "success" };
}
