import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";

export function resolveHarness(value?: string): HarnessKind {
	if (value === "claude" || value === "codex" || value === "pi") return value;
	return loadConfig().harness.engine;
}
