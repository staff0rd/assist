import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { attachmentContentType } from "../sessions/web/attachmentContentType";
import { stageAttachment } from "../sessions/web/stageAttachment";

export function stageScreenshots(
	screenshots: PreviewAttachment[] = [],
): Promise<PreviewAttachment[]> {
	return Promise.all(
		screenshots.map(async (screenshot) => {
			const { filePath } = await stageAttachment(
				basename(screenshot.path),
				attachmentContentType(screenshot.path),
				await readFile(screenshot.path),
			);
			return { ...screenshot, path: filePath };
		}),
	);
}
