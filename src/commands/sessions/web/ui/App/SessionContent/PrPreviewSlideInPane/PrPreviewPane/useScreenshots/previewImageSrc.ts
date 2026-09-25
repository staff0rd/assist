import { isUserAttachmentUrl } from "../../../../../../isUserAttachmentUrl";
import { screenshotPreviewUrl } from "./previewImageSrc/screenshotPreviewUrl";

export function previewImageSrc(
	markdown: string,
	cwd: string | undefined,
): string {
	const url = screenshotPreviewUrl(markdown);
	if (!isUserAttachmentUrl(url)) return url;

	const params = new URLSearchParams({ url });
	if (cwd) params.set("cwd", cwd);
	return `/api/pr-preview/image?${params}`;
}
