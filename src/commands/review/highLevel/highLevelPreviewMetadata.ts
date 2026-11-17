import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";

function reopenedFrom(subject: HighLevelOverlaySubject): PreviewMetadata[] {
	const at = subject.progress?.updatedAt ?? subject.saved?.reviewedAt;
	return at ? [{ label: "Reopened from", value: at }] : [];
}

export function highLevelPreviewMetadata(
	subject: HighLevelOverlaySubject,
): PreviewMetadata[] {
	return [
		{ label: "Branch", value: subject.headRef },
		{ label: "Head", value: subject.headSha.slice(0, 7) },
		...reopenedFrom(subject),
	];
}
