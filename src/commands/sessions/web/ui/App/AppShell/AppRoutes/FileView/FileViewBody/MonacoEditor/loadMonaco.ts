import type * as monaco from "monaco-editor/editor";

export type MonacoApi = typeof monaco;

const SCRIPT_URL = "/monaco.js";
const STYLESHEET_URL = "/monaco.css";
const WORKER_URL = "/monaco.worker.js";

let pending: Promise<MonacoApi> | undefined;

function monacoGlobal(): MonacoApi | undefined {
	return (globalThis as unknown as { monaco?: MonacoApi }).monaco;
}

function injectStylesheet(): Promise<void> {
	if (document.querySelector(`link[href="${STYLESHEET_URL}"]`))
		return Promise.resolve();
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = STYLESHEET_URL;
		link.addEventListener("load", () => resolve());
		link.addEventListener("error", () =>
			reject(new Error(`Failed to load ${STYLESHEET_URL}`)),
		);
		document.head.append(link);
	});
}

function injectScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = SCRIPT_URL;
		script.addEventListener("load", () => resolve());
		script.addEventListener("error", () =>
			reject(new Error(`Failed to load ${SCRIPT_URL}`)),
		);
		document.head.append(script);
	});
}

async function inject(): Promise<MonacoApi> {
	globalThis.MonacoEnvironment = { getWorker: () => new Worker(WORKER_URL) };
	await Promise.all([injectStylesheet(), injectScript()]);
	const api = monacoGlobal();
	if (!api) throw new Error(`${SCRIPT_URL} did not register the editor API`);
	return api;
}

export function loadMonaco(): Promise<MonacoApi> {
	const existing = monacoGlobal();
	if (existing) return Promise.resolve(existing);
	pending ??= inject().catch((error) => {
		pending = undefined;
		throw error;
	});
	return pending;
}
