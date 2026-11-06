import type { AssistConfig } from "../../shared/types";

export function askQuestionEnabled(config: AssistConfig): boolean {
	return config.sessions?.askQuestion !== false;
}
