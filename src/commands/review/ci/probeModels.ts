import type { ReviewCiEndpoints } from "./deriveEndpoints";
import type { ReviewCiSlot } from "./parseSlot";
import { probeEndpoint } from "./probeEndpoint";
import type { ReviewCiConfig } from "./readReviewCiEnv";

function claudeAuthHeaders(
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
	token: string,
): Record<string, string> {
	const bearer = { Authorization: `Bearer ${token}` };
	if (config.auth.kind === "entra") return bearer;
	if (endpoints.anthropicKind === "foundry") return { "x-api-key": token };
	return { ...bearer, "x-api-key": token };
}

async function probeSlot(
	slot: ReviewCiSlot,
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
	token: string,
): Promise<string | undefined> {
	if (slot.harness === "codex") {
		const url = `${endpoints.responses}/responses`;
		const error = await probeEndpoint(
			url,
			{ Authorization: `Bearer ${token}` },
			{ model: slot.model, input: "ping", max_output_tokens: 16 },
		);
		return error && `Codex model "${slot.model}" at ${url}: ${error}`;
	}
	const url = `${endpoints.anthropic}/v1/messages`;
	const error = await probeEndpoint(
		url,
		{
			...claudeAuthHeaders(config, endpoints, token),
			"anthropic-version": "2023-06-01",
		},
		{
			model: slot.model,
			max_tokens: 1,
			messages: [{ role: "user", content: "ping" }],
		},
	);
	return error && `Claude model "${slot.model}" at ${url}: ${error}`;
}

function distinctSlots(config: ReviewCiConfig): ReviewCiSlot[] {
	const byKey = new Map<string, ReviewCiSlot>();
	for (const slot of Object.values(config.slots))
		byKey.set(`${slot.harness}:${slot.model}`, slot);
	return [...byKey.values()];
}

export async function probeModels(
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
	token: string,
): Promise<string[]> {
	const errors = await Promise.all(
		distinctSlots(config).map((slot) =>
			probeSlot(slot, config, endpoints, token),
		),
	);
	return errors.filter((error): error is string => Boolean(error));
}
