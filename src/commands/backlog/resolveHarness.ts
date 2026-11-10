import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import type { AssistConfig } from "../../shared/types";

type HarnessDefaultsType = keyof NonNullable<
	AssistConfig["harness"]["defaults"]
>;

export function resolveHarness(
	value?: string,
	type?: HarnessDefaultsType,
): HarnessKind {
	if (value === "claude" || value === "codex" || value === "pi") return value;
	const { harness } = loadConfig();
	return (type && harness.defaults?.[type]?.harness) || harness.engine;
}
