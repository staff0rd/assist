import type { PreviewKind } from "../../../shared/SessionInfoBase";
import { PhonePanePreview } from "./PhoneSessionPreview/PhonePanePreview";
import type { PhonePreviewProps } from "./PhoneSessionPreview/PhonePreviewProps";
import { PhoneReviewPreview } from "./PhoneSessionPreview/PhoneReviewPreview";

const OWN_PANE_KINDS: PreviewKind[] = [
	"show",
	"miro-board",
	"high-level-review",
];

export function PhoneSessionPreview(props: PhonePreviewProps) {
	const kind = props.preview.kind;
	if (kind && OWN_PANE_KINDS.includes(kind))
		return <PhonePanePreview {...props} />;
	return <PhoneReviewPreview {...props} />;
}
