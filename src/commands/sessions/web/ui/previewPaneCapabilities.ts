import type { PreviewKind } from "../../shared/SessionInfoBase";

export function previewPaneCapabilities(kind: PreviewKind | undefined): {
	isPr: boolean;
	screenshots: boolean;
	editable: boolean;
} {
	const resolved = kind ?? "pr";
	return {
		isPr: resolved === "pr",
		screenshots: resolved === "pr" || resolved === "github-issue",
		editable: resolved === "github-issue-edit",
	};
}
