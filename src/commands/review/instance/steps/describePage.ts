import type { Page } from "playwright";

export async function describePage(page: Page): Promise<string> {
	const snapshot = await page.locator("body").ariaSnapshot();
	return `URL: ${page.url()}\nTitle: ${await page.title()}\n\n${snapshot}`;
}
