import {
	buildCodexProviderArgs,
	type CodexModelOverride,
} from "./buildCodexProviderArgs";
import { readLitellmConfig } from "./readLitellmConfig";

export function buildLitellmCodexArgs(
	rawModel: string | undefined,
): CodexModelOverride {
	const model = rawModel?.trim();
	if (!model) return { args: [], env: {} };
	const { config } = readLitellmConfig();
	if (!config) return { args: [], env: {} };
	return buildCodexProviderArgs(`${config.baseUrl}/v1`, config.apiKey, model);
}
