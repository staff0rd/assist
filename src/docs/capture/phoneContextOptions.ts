import type { BrowserContextOptions } from "playwright";
import { phoneInsets } from "./phoneInsets";

const IPHONE_SCREEN = { width: 390, height: 844 };

export const phoneContextOptions = {
	viewport: {
		width: IPHONE_SCREEN.width,
		height:
			IPHONE_SCREEN.height - phoneInsets.statusBar - phoneInsets.homeIndicator,
	},
	deviceScaleFactor: 2,
	isMobile: true,
	hasTouch: true,
} satisfies BrowserContextOptions;
