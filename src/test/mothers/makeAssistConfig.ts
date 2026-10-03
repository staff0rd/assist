import type { z } from "zod";
import { type AssistConfig, assistConfigSchema } from "../../shared/types";

export type AssistConfigInput = z.input<typeof assistConfigSchema>;

export function makeAssistConfig(
	overrides: AssistConfigInput = {},
): AssistConfig {
	return assistConfigSchema.parse(overrides);
}
