import { join } from "node:path";
import type { Page } from "playwright";

export async function saveSessionVideo(
	page: Page,
	reportDir: string,
): Promise<string | undefined> {
	const video = page.video();
	if (!video) return undefined;
	const path = join(reportDir, "session.webm");
	await video.saveAs(path);
	await video.delete();
	return path;
}
