import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { renderScreenshotBlock } from "./renderScreenshotBlock";

export function renderScreenshotsSection(
	attachments: PreviewAttachment[],
): string {
	const groups = new Map<string, PreviewAttachment[]>();
	const ungrouped: PreviewAttachment[] = [];
	for (const attachment of attachments) {
		if (!attachment.group) {
			ungrouped.push(attachment);
			continue;
		}
		const members = groups.get(attachment.group) ?? [];
		members.push(attachment);
		groups.set(attachment.group, members);
	}

	const blocks = [...groups].flatMap(([group, members]) => [
		`### ${group}`,
		...renderScreenshotBlock(members),
	]);
	return [
		"## Screenshots",
		...blocks,
		...renderScreenshotBlock(ungrouped),
	].join("\n\n");
}
