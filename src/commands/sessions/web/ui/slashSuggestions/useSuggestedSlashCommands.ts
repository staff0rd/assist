import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessCapability } from "../../../../../shared/harnessAdapters/harnessCapability";
import { useSlashCommands } from "./useSlashCommands";

export function useSuggestedSlashCommands(
	harness: HarnessKind | undefined,
	cwd: string | undefined,
	node: string | undefined,
) {
	const suggest = harnessCapability(harness, "slashCommands.suggest").supported;
	return useSlashCommands(suggest ? cwd : undefined, node);
}
