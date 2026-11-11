import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import { type HarnessDefaultsType, resolveHarness } from "./resolveHarness";

export function resolveModel(
	value: string | false | undefined,
	type: HarnessDefaultsType,
	harness: HarnessKind,
): string | undefined {
	if (value === false) return undefined;
	if (value) return value;
	if (resolveHarness(undefined, type) !== harness) return undefined;
	return loadConfig().harness.defaults?.[type]?.model;
}
