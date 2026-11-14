import type { HarnessKind } from "../harnesses";
import { resolveHarness } from "./harnessLabel";
import { harnessUsageAccounts } from "./harnessUsageAccounts";

export function isPrimaryUsageAccount(
	harness: HarnessKind | undefined,
): boolean {
	const account = harnessUsageAccounts[resolveHarness(harness)] as
		| (typeof harnessUsageAccounts)[HarnessKind]
		| undefined;
	return account !== undefined && !account.windowPrefix;
}
