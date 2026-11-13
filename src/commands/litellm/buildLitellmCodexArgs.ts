import { resolveCodexModel } from "../../shared/resolveCodexModel";
import {
	buildCodexProviderArgs,
	type CodexModelOverride,
} from "./buildCodexProviderArgs";
import { readLitellmConfig } from "./readLitellmConfig";

export function buildLitellmCodexArgs(
	rawModel: string | undefined,
): CodexModelOverride {
	const model = resolveCodexModel(rawModel);
	if (!model) return { args: [], env: {} };
	const { config } = readLitellmConfig();
	if (!config) return { args: [], env: {} };
	return buildCodexProviderArgs(`${config.baseUrl}/v1`, config.apiKey, model);
}
