import type { HarnessKind } from "../../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../../shared/harnessAdapters/harnessLabel";
import type { SessionModel } from "../../../sessionModel";

export function modeSuffix(
	harness: HarnessKind,
	pickHarness: boolean,
	model: SessionModel | undefined,
): string | undefined {
	if (!pickHarness && !model) return undefined;
	return [harnessLabel(harness), model?.model].filter(Boolean).join(" · ");
}
