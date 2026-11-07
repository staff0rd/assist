import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

type HarnessActivityFields = {
	harness?: HarnessKind;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export function harnessActivityFields(
	harness: HarnessKind | undefined,
	claudeSessionId: string,
	resumeSessionId?: string,
): HarnessActivityFields {
	const kind = resolveHarness(harness);
	if (kind === "claude") return { claudeSessionId };
	return resumeSessionId
		? { harness: kind, harnessSessionId: resumeSessionId }
		: { harness: kind };
}
