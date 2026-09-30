import { loadConfig } from "../../shared/loadConfig";
import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";
import { buildLitellmCodexArgs } from "../litellm/buildLitellmCodexArgs";

export function buildCodexModelArgs(): CodexModelOverride {
	return buildLitellmCodexArgs(loadConfig().review?.codexModel);
}
