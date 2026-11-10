import { prActions } from "../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../shared/reviewButtonModes";
import { reviewModeEntries } from "../../App/reviewModeEntries";
import { useReviewHarness } from "../../App/useReviewHarness";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";

const reviewModes = reviewButtonModes.filter(
	(mode) => !mode.args.includes("--high-level"),
);
const harnessPrActions = prActions.filter((action) => action.featureId);

export function usePhonePrModes(node: string | undefined) {
	const capabilities = useHarnessCapabilities(node);
	const { choices, harness, setHarness } = useReviewHarness(capabilities, [
		...reviewModes,
		...harnessPrActions,
	]);
	const modes = [
		...reviewModeEntries(capabilities, reviewModes, harness),
		...reviewModeEntries(capabilities, harnessPrActions, harness),
	].filter((mode) => !mode.disabled);
	return { choices, harness, setHarness, modes };
}
