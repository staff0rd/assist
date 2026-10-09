import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { renderScreenshotsSection } from "./renderScreenshotsSection";

function withoutScreenshotsSection(body: string): string {
	return body
		.replace(/(^|\n)## Screenshots[ \t]*(?:\n[\s\S]*?)?(?=\n## |$)/, "")
		.trimEnd();
}

export function appendScreenshots(
	body: string,
	attachments: PreviewAttachment[],
): string {
	if (attachments.length === 0) return body;
	const base = withoutScreenshotsSection(body);
	const section = renderScreenshotsSection(attachments);
	return base ? `${base}\n\n${section}` : section;
}
