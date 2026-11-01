import type { Page } from "playwright";
import { phoneFrameHtml } from "./phoneFrameHtml";

export async function framePhoneScreenshot(
	page: Page,
	theme: "light" | "dark",
	path: string,
): Promise<void> {
	const shot = await page.screenshot({ animations: "disabled" });
	const background = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);
	const frame = await page.context().newPage();
	await frame.setViewportSize({ width: 600, height: 1200 });
	await frame.setContent(
		phoneFrameHtml(shot.toString("base64"), background, theme),
	);
	await frame
		.locator("#phone")
		.screenshot({ path, omitBackground: true, animations: "disabled" });
	await frame.close();
}
