import { join } from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import type { DocsScreenshot } from "../docsPageSchema";
import { docsPaths } from "../docsPaths";
import { screenshotVariants } from "../screenshotVariants";
import { drawHighlights } from "./drawHighlights";
import { openGithubPage } from "./openGithubPage";
import { saveScreenshot } from "./saveScreenshot";
import { performAction } from "./performAction";
import { framePhoneScreenshot } from "./framePhoneScreenshot";
import { newCaptureContext } from "./newCaptureContext";
import { routeApiStubs } from "./routeApiStubs";

const SETTLE_MS = 750;

async function openPage(
	context: BrowserContext,
	baseUrl: string,
	screenshot: DocsScreenshot,
): Promise<Page> {
	if (screenshot.url) return openGithubPage(context, screenshot.url);
	const page = await context.newPage();
	await page.goto(`${baseUrl}${screenshot.route}`, { waitUntil: "load" });
	return page;
}

export async function captureScreenshot(
	browser: Browser,
	baseUrl: string,
	screenshot: DocsScreenshot,
	apiStubs: ReadonlyMap<string, unknown>,
): Promise<string[]> {
	const written: string[] = [];
	for (const variant of screenshotVariants(screenshot)) {
		const context = await newCaptureContext(
			browser,
			baseUrl,
			screenshot,
			variant.theme,
		);
		await routeApiStubs(context, apiStubs);
		const page = await openPage(context, baseUrl, screenshot);
		if (screenshot.waitFor) await page.waitForSelector(screenshot.waitFor);
		for (const action of screenshot.actions ?? [])
			await performAction(page, action);
		await page.waitForTimeout(SETTLE_MS);
		await drawHighlights(page, screenshot.highlight ?? []);
		const path = join(docsPaths.screenshotsDir, variant.file);
		if (screenshot.phone) await framePhoneScreenshot(page, variant.theme, path);
		else await saveScreenshot(page, screenshot, path);
		await context.close();
		written.push(variant.file);
	}
	return written;
}
