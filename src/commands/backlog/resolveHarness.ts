import {
	type HarnessKind,
	harnesses,
	isHarnessAvailable,
} from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import { loadMergedRawConfig } from "../../shared/loadConfigFrom";
import type { AssistConfig } from "../../shared/types";

export type HarnessDefaultsType = keyof NonNullable<
	AssistConfig["harness"]["defaults"]
>;

export function resolveHarness(
	value?: string,
	type?: HarnessDefaultsType,
): HarnessKind {
	if (value === "claude" || value === "codex" || value === "pi") return value;
	const { harness } = loadConfig();
	const configured = type && harness.defaults?.[type]?.harness;
	if (configured) return configured;
	if (type !== "run" || harness.engine !== "claude") return harness.engine;
	const rawHarness = loadMergedRawConfig(process.cwd()).harness as
		| { engine?: HarnessKind }
		| undefined;
	if (rawHarness?.engine) return harness.engine;
	return (
		(Object.keys(harnesses) as HarnessKind[]).find(isHarnessAvailable) ||
		harness.engine
	);
}
