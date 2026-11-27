import type { Page } from "playwright";
import { BROWSER_SOURCE } from "./createLogRules";

export function watchBrowserErrors(
	page: Page,
	record: (source: string, message: string) => void,
): void {
	page.on("console", (message) => {
		if (message.type() === "error")
			record(BROWSER_SOURCE, `console: ${message.text()}`);
	});
	page.on("pageerror", (error) =>
		record(BROWSER_SOURCE, `pageerror: ${error.message}`),
	);
	page.on("response", (response) => {
		if (response.status() >= 500)
			record(
				BROWSER_SOURCE,
				`${response.status()} ${response.request().method()} ${response.url()}`,
			);
	});
}
