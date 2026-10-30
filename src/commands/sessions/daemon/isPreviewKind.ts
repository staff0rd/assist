import type { PreviewKind } from "../shared/SessionInfoBase";

const PREVIEW_KINDS: PreviewKind[] = [
	"pr",
	"backlog-item",
	"pr-comment",
	"github-issue",
	"github-issue-comment",
	"github-issue-edit",
	"miro-board",
	"slack-post",
	"high-level-review",
	"show",
	"ask",
	"question",
];

export function isPreviewKind(value: unknown): value is PreviewKind {
	return PREVIEW_KINDS.includes(value as PreviewKind);
}
