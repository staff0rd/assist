import type { NewSessionMode } from "../newSessionModes";
import type { LoadedDefaultMode } from "./useDefaultNewSessionMode";

export function defaultModeError(
	chosenMode: NewSessionMode | undefined,
	defaultMode: LoadedDefaultMode | null,
): string | undefined {
	if (chosenMode !== undefined || !defaultMode || defaultMode.pending)
		return undefined;
	return defaultMode.error;
}
