import type { HarnessKind } from "../harnesses";
import { resolveHarness } from "../harnessLabel";
import { harnessUsageAccounts } from "./harnessUsageAccounts";

export function isPrimaryUsageAccount(
	harness: HarnessKind | undefined,
): boolean {
	return !harnessUsageAccounts[resolveHarness(harness)].windowPrefix;
}
