import type { BrowserContextOptions, LaunchOptions } from "playwright";
import type { StorageState } from "../auth/signIn";

const VIEWPORT = { width: 1280, height: 800 };
const HEADED_SLOW_MO_MS = 250;

export function browserLaunchOptions(headed: boolean): LaunchOptions {
	return headed
		? { headless: false, slowMo: HEADED_SLOW_MO_MS }
		: { headless: true };
}

export function browserContextOptions(
	headed: boolean,
	videoDir: string,
	storageState?: StorageState,
): BrowserContextOptions {
	const base = storageState
		? { viewport: VIEWPORT, storageState }
		: { viewport: VIEWPORT };
	return headed
		? base
		: { ...base, recordVideo: { dir: videoDir, size: VIEWPORT } };
}
