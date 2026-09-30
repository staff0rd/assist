import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";

export type ReviewerModels = {
	claude?: CodexModelOverride;
	codex?: CodexModelOverride;
};
