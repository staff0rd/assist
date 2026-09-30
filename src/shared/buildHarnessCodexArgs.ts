import type { CodexModelOverride } from "../commands/litellm/buildCodexProviderArgs";
import { buildLitellmCodexArgs } from "../commands/litellm/buildLitellmCodexArgs";
import { loadConfig } from "./loadConfig";

export function buildHarnessCodexArgs(): CodexModelOverride {
	return buildLitellmCodexArgs(loadConfig().harness.codexModel);
}
