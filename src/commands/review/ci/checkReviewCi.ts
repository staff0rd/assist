import { deriveEndpoints } from "./deriveEndpoints";
import { probeModels } from "./probeModels";
import { readReviewCiEnv } from "./readReviewCiEnv";
import { resolveReviewCiToken } from "./resolveReviewCiToken";

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export async function checkReviewCi(env: NodeJS.ProcessEnv): Promise<string[]> {
	const { config, errors } = readReviewCiEnv(env);
	if (!config) return errors;

	let endpoints: ReturnType<typeof deriveEndpoints>;
	try {
		endpoints = deriveEndpoints(config.provider, config.baseUrl);
	} catch (error) {
		return [message(error)];
	}
	let token: string;
	try {
		token = await resolveReviewCiToken(config.auth, env);
	} catch (error) {
		return [message(error)];
	}
	return probeModels(config, endpoints, token);
}
