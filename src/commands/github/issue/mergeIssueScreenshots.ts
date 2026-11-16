import { appendScreenshots } from "../../prs/appendScreenshots";
import { renderScreenshotsSection } from "../../prs/renderScreenshotsSection";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";

const HEADING = "## Screenshots";

export function mergeIssueScreenshots(
	body: string,
	attachments: PreviewAttachment[],
): string {
	if (attachments.length === 0) return body;
	const heading = /(^|\n)## Screenshots[ \t]*(?=\n|$)/.exec(body);
	if (!heading) return appendScreenshots(body, attachments);

	const sectionStart = heading.index + heading[0].length;
	const next = body.indexOf("\n## ", sectionStart);
	const sectionEnd = next === -1 ? body.length : next;
	const added = renderScreenshotsSection(attachments).slice(
		`${HEADING}\n\n`.length,
	);
	const rest = body.slice(sectionEnd);
	return `${body.slice(0, sectionEnd).trimEnd()}\n\n${added}${rest ? `\n${rest}` : ""}`;
}
