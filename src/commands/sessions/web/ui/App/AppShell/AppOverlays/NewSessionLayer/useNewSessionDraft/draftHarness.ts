import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "../newSessionModes";
import type { LoadedDefaultMode } from "./useDefaultNewSessionMode";

export function draftHarness(
	picked: HarnessKind | undefined,
	defaultMode: LoadedDefaultMode | null,
	mode: NewSessionMode,
): HarnessKind {
	return picked ?? defaultMode?.harnesses[mode] ?? "claude";
}
