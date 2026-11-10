import { harnessKinds } from "../../../../../../../../../shared/harnessKinds";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { type NewSessionMode, newSessionModes } from "../newSessionModes";

export type ModeHarnesses = Partial<Record<NewSessionMode, HarnessKind>>;

export function parseModeHarnesses(value: unknown): ModeHarnesses {
	if (!value || typeof value !== "object") return {};
	const harnesses: ModeHarnesses = {};
	for (const [mode, harness] of Object.entries(value)) {
		if (
			Object.hasOwn(newSessionModes, mode) &&
			(harnessKinds as readonly unknown[]).includes(harness)
		)
			harnesses[mode as NewSessionMode] = harness as HarnessKind;
	}
	return harnesses;
}
