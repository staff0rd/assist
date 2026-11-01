import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser } from "playwright";
import { docsDescription } from "../docsDescription";
import { docsPaths } from "../docsPaths";
import { socialCardHtml, socialCardSize } from "./socialCardHtml";

export const socialCardSource = "sessions-dashboard.png";

export async function renderSocialCard(browser: Browser): Promise<void> {
	const shot = readFileSync(
		join(docsPaths.screenshotsDir, "sessions-dashboard-dark.png"),
	);
	const logo = readFileSync(
		join(docsPaths.extensionDir, "icons/assist-128.png"),
	);
	const page = await browser.newPage({ viewport: socialCardSize });
	await page.setContent(
		socialCardHtml(
			shot.toString("base64"),
			logo.toString("base64"),
			docsDescription,
		),
	);
	await page.screenshot({ path: docsPaths.socialCard, animations: "disabled" });
	await page.close();
}
