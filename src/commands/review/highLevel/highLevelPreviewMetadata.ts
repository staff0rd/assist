import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";
import { highLevelChangedFileCount } from "./highLevelChangedFileCount";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";

export function highLevelPreviewMetadata(
	subject: HighLevelOverlaySubject,
): PreviewMetadata[] {
	return [
		{ label: "Branch", value: subject.headRef },
		{ label: "Head", value: subject.headSha.slice(0, 7) },
		{
			label: "Changed files",
			value: String(highLevelChangedFileCount(subject.structure)),
		},
		{ label: "Critical files", value: String(subject.criticalDiffs.length) },
		...(subject.saved
			? [{ label: "Reopened from", value: subject.saved.reviewedAt }]
			: []),
	];
}
