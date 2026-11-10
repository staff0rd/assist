import { useState } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import type { ReviewButtonMode } from "../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../useHarnessCapabilities";
import { reviewHarnessChoices } from "./reviewHarnessChoices";

export function useReviewHarness(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[],
) {
	const [picked, setPicked] = useState<HarnessKind>();
	const choices = reviewHarnessChoices(capabilities, modes);
	const harness = picked && choices.includes(picked) ? picked : choices[0];
	return { choices, harness, setHarness: setPicked };
}
