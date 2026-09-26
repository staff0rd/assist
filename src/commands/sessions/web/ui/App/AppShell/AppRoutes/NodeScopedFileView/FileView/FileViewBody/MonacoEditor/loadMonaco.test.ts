// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { loadMonaco, type MonacoApi } from "./loadMonaco";

const fakeApi = { editor: {} } as unknown as MonacoApi;

function scripts(): HTMLScriptElement[] {
	return [
		...document.querySelectorAll<HTMLScriptElement>('script[src="/monaco.js"]'),
	];
}

function stylesheets(): Element[] {
	return [...document.querySelectorAll('link[href="/monaco.css"]')];
}

function lastScript(): HTMLScriptElement {
	const all = scripts();
	const script = all.at(-1);
	if (!script) throw new Error("no monaco script was injected");
	return script;
}

afterEach(() => {
	delete (globalThis as { monaco?: MonacoApi }).monaco;
});

function lastStylesheet(): Element {
	const link = stylesheets().at(-1);
	if (!link) throw new Error("no monaco stylesheet was injected");
	return link;
}

describe("loadMonaco", () => {
	it("rejects when the stylesheet fails to load", async () => {
		const loading = loadMonaco();

		expect(stylesheets()).toHaveLength(1);
		expect(typeof globalThis.MonacoEnvironment?.getWorker).toBe("function");
		lastStylesheet().dispatchEvent(new Event("error"));

		await expect(loading).rejects.toThrow("Failed to load /monaco.css");
	});

	it("rejects when the bundle fails to load", async () => {
		const loading = loadMonaco();

		lastScript().dispatchEvent(new Event("error"));

		await expect(loading).rejects.toThrow("Failed to load /monaco.js");
	});

	it("rejects when the bundle registers no api", async () => {
		const loading = loadMonaco();

		lastScript().dispatchEvent(new Event("load"));

		await expect(loading).rejects.toThrow("did not register the editor API");
	});

	it("resolves with the api the bundle registered", async () => {
		const loading = loadMonaco();
		(globalThis as { monaco?: MonacoApi }).monaco = fakeApi;

		lastScript().dispatchEvent(new Event("load"));

		await expect(loading).resolves.toBe(fakeApi);
	});

	it("reuses the loaded api without injecting the bundle again", async () => {
		(globalThis as { monaco?: MonacoApi }).monaco = fakeApi;
		const injected = scripts().length;

		await expect(loadMonaco()).resolves.toBe(fakeApi);

		expect(scripts()).toHaveLength(injected);
		expect(stylesheets()).toHaveLength(1);
	});
});
