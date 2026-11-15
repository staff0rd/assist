import { join } from "node:path";
import type { Page } from "playwright";
import type { DocsScreenshotAction } from "../docsPageSchema";
import { docsPaths } from "../docsPaths";
import { dragBetween } from "./dragBetween";

export async function performAction(
	page: Page,
	action: DocsScreenshotAction,
): Promise<void> {
	if ("click" in action) await page.locator(action.click).first().click();
	else if ("press" in action) await page.keyboard.press(action.press);
	else if ("hover" in action) await page.locator(action.hover).first().hover();
	else if ("drag" in action)
		await dragBetween(page, action.drag.from, action.drag.to);
	else if ("script" in action)
		await page.addScriptTag({
			path: join(docsPaths.captureScripts, `${action.script}.js`),
		});
	else await page.keyboard.type(action.type);
}
