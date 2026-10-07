import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";

export type Harness = "claude" | "codex";

export type SlotModel = {
	harness: Harness;
	label: string;
	override: CodexModelOverride;
};

export type ReviewerModels = {
	claude?: SlotModel;
	codex?: SlotModel;
	synthesis?: SlotModel;
};
