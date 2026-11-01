import type { Browser, BrowserContext } from "playwright";
import type { DocsScreenshot } from "../docsPageSchema";
import { phoneContextOptions } from "./phoneContextOptions";
import { seedPhoneHomeNode } from "./seedPhoneHomeNode";

const DEFAULT_VIEWPORT = { width: 1280, height: 800 };

export async function newCaptureContext(
	browser: Browser,
	baseUrl: string,
	screenshot: DocsScreenshot,
	theme: "light" | "dark",
): Promise<BrowserContext> {
	const phone = screenshot.phone ? phoneContextOptions : undefined;
	const context = await browser.newContext({
		...phone,
		viewport: screenshot.viewport ?? phone?.viewport ?? DEFAULT_VIEWPORT,
		colorScheme: theme,
		bypassCSP: screenshot.url !== undefined,
	});
	await context.addInitScript((mode) => {
		localStorage.setItem("theme-mode", mode);
	}, theme);
	if (phone) await seedPhoneHomeNode(context, baseUrl);
	return context;
}
