import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BrowserContext, Page } from "playwright";
import { docsPaths } from "../docsPaths";

const HYDRATION_MS = 2000;

function extensionApiStub(icon: string): string {
	return `
		const store = {};
		globalThis.browser = {
			runtime: {
				sendMessage: async (message) =>
					message?.type === "assist-link-status"
						? { ok: true, states: globalThis.assistCaptureLinkStates ?? {} }
						: { ok: true },
				getURL: () => ${JSON.stringify(icon)},
				onMessage: { addListener: () => undefined },
			},
			storage: {
				local: {
					get: async () => store,
					set: async (items) => Object.assign(store, items),
				},
			},
		};
	`;
}

export async function openGithubPage(
	context: BrowserContext,
	url: string,
): Promise<Page> {
	const icon = readFileSync(
		join(docsPaths.extensionDir, "icons/assist-32.png"),
	);
	await context.addInitScript({
		content: extensionApiStub(
			`data:image/png;base64,${icon.toString("base64")}`,
		),
	});
	const page = await context.newPage();
	await page.goto(url, { waitUntil: "load" });
	await page.waitForSelector('[data-component="PH_Actions"]', {
		state: "attached",
	});
	await page.waitForTimeout(HYDRATION_MS);
	await page.addScriptTag({
		path: join(docsPaths.extensionDir, "content.js"),
	});
	return page;
}
