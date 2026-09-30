import { deriveEndpoints } from "./deriveEndpoints";
import { probeModels } from "./probeModels";
import { readReviewCiEnv } from "./readReviewCiEnv";

export async function checkReviewCi(env: NodeJS.ProcessEnv): Promise<string[]> {
	const { config, missing } = readReviewCiEnv(env);
	if (!config) return missing.map((key) => `${key} is not set`);

	let endpoints: ReturnType<typeof deriveEndpoints>;
	try {
		endpoints = deriveEndpoints(config.provider, config.baseUrl);
	} catch (error) {
		return [error instanceof Error ? error.message : String(error)];
	}
	return probeModels(config, endpoints);
}
