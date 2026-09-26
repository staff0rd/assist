import { isUserAttachmentUrl } from "../../../../../../isUserAttachmentUrl";
import { screenshotPreviewUrl } from "./previewImageSrc/screenshotPreviewUrl";

export function previewImageSrc(
	markdown: string,
	cwd: string | undefined,
	node?: string,
): string {
	const url = screenshotPreviewUrl(markdown);
	if (!isUserAttachmentUrl(url)) return url;

	const params = new URLSearchParams({ url });
	if (cwd) params.set("cwd", cwd);
	if (node) params.set("node", node);
	return `/api/pr-preview/image?${params}`;
}
