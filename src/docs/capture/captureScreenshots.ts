import { chromium } from "playwright";
import type { CaptureSetupStep } from "../captureSetupStepSchema";
import type { DocsScreenshot } from "../docsPageSchema";
import { docsPaths } from "../docsPaths";
import type { CaptureScenes } from "../loadCaptureScenes";
import { captureScreenshot } from "./captureScreenshot";
import { closePreviews } from "./closePreviews";
import { renderSocialCard, socialCardSource } from "./renderSocialCard";
import type { CaptureHome } from "./createCaptureHome";
import { sessionStateTracker } from "./sessionStateTracker";

function setupSteps(
	screenshot: DocsScreenshot,
	scenes: CaptureScenes,
): CaptureSetupStep[] {
	const scene = screenshot.scene ? (scenes[screenshot.scene] ?? []) : [];
	return [...scene, ...(screenshot.setup ?? [])];
}

export async function captureScreenshots(
	capture: CaptureHome,
	url: string,
	screenshots: DocsScreenshot[],
	scenes: CaptureScenes,
): Promise<void> {
	const browser = await chromium.launch();
	const enterState = sessionStateTracker(capture);
	try {
		for (const screenshot of screenshots) {
			await enterState(setupSteps(screenshot, scenes));
			const files = await captureScreenshot(browser, url, screenshot);
			console.log(`Captured ${files.join(", ")}`);
		}
		if (screenshots.some((s) => s.file === socialCardSource)) {
			await renderSocialCard(browser);
			console.log(`Rendered ${docsPaths.socialCard}`);
		}
	} finally {
		closePreviews(capture);
		await browser.close();
	}
}
