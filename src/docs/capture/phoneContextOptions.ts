import type { BrowserContextOptions } from "playwright";

export const phoneContextOptions = {
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 2,
	isMobile: true,
	hasTouch: true,
} satisfies BrowserContextOptions;
