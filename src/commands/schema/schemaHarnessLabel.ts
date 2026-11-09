import type { HarnessKind } from "../../shared/harnesses";
import { harnessLabel } from "../../shared/harnessLabel";

export function schemaHarnessLabel(harness: string): string {
	return harnessLabel(harness as HarnessKind);
}
