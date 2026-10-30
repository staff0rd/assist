import type { BrowserTab } from "./pickTargetTab";

type Listener<T> = { addListener: (listener: (value: T) => void) => void };

type UserScriptInjectionResult = { result?: unknown; error?: string };

export type UserScriptsApi = {
	execute?: (injection: {
		js: { code: string }[];
		target: { tabId: number };
		injectImmediately?: boolean;
	}) => Promise<UserScriptInjectionResult[]>;
};

type BrowserApi = {
	runtime: {
		getManifest: () => { version: string };
		openOptionsPage?: () => Promise<void>;
	};
	tabs: {
		query: (filter: Record<string, unknown>) => Promise<BrowserTab[]>;
		sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
	};
	windows?: { getLastFocused: () => Promise<{ id?: number }> };
	alarms?: {
		create: (name: string, info: { periodInMinutes: number }) => void;
		onAlarm: Listener<{ name: string }>;
	};
	storage?: { onChanged: Listener<Record<string, unknown>> };
	permissions?: {
		contains: (permissions: { permissions: string[] }) => Promise<boolean>;
	};
	userScripts?: UserScriptsApi;
};

export function browserApi(): BrowserApi | undefined {
	const api = (globalThis as { browser?: Partial<BrowserApi> }).browser;
	return api?.runtime && api.tabs ? (api as BrowserApi) : undefined;
}
