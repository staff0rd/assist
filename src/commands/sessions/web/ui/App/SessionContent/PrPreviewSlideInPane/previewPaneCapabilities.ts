import type { PreviewKind } from "../../../../../shared/SessionInfoBase";

export function previewPaneCapabilities(kind: PreviewKind | undefined): {
	isPr: boolean;
	screenshots: boolean;
	editable: boolean;
	closeOnly: boolean;
} {
	const resolved = kind ?? "pr";
	return {
		isPr: resolved === "pr",
		screenshots:
			resolved === "pr" ||
			resolved === "github-issue" ||
			resolved === "github-issue-edit" ||
			resolved === "github-issue-comment",
		editable: resolved === "github-issue-edit",
		closeOnly: resolved === "show",
	};
}
