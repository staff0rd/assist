import { rmSync } from "node:fs";
import { dirname } from "node:path";
import type { PreviewAttachment } from "../commands/sessions/shared/PreviewAttachment";
import { isStagedAttachmentPath } from "./isStagedAttachmentPath";

export function removeStagedAttachments(
	attachments: PreviewAttachment[],
): void {
	for (const { path } of attachments) {
		const dir = dirname(path);
		if (!isStagedAttachmentPath(dir)) continue;
		rmSync(dir, { recursive: true, force: true });
	}
}
