import type { PreviewKind } from "../shared/SessionInfoBase";

const PREVIEW_KINDS: PreviewKind[] = [
	"pr",
	"backlog-item",
	"backlog-comment",
	"pr-comment",
	"github-issue",
	"github-issue-comment",
	"github-issue-edit",
	"miro-board",
	"slack-post",
];

export function isPreviewKind(value: unknown): value is PreviewKind {
	return PREVIEW_KINDS.includes(value as PreviewKind);
}
