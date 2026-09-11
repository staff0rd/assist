import { loadConfig } from "../../shared/loadConfig";

export type LitellmConfig = { baseUrl: string; apiKey: string };

export function readLitellmConfig(): {
	config: LitellmConfig | null;
	missing: string[];
} {
	const litellm = loadConfig().litellm;
	const baseUrl = litellm?.baseUrl?.trim();
	const apiKey = litellm?.apiKey?.trim();
	const missing = [
		...(baseUrl ? [] : ["litellm.baseUrl"]),
		...(apiKey ? [] : ["litellm.apiKey"]),
	];
	if (!baseUrl || !apiKey) return { config: null, missing };
	return { config: { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey }, missing };
}
