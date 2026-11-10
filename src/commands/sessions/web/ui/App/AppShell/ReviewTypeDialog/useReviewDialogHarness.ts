import { prActions } from "../../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../../shared/reviewButtonModes";
import { useApiNode } from "../../../useApiNode";
import { useHarnessCapabilities } from "../../../useHarnessCapabilities";
import { useReviewHarness } from "../../useReviewHarness";

export function useReviewDialogHarness() {
	const capabilities = useHarnessCapabilities(useApiNode());
	return {
		capabilities,
		...useReviewHarness(capabilities, [...reviewButtonModes, ...prActions]),
	};
}
