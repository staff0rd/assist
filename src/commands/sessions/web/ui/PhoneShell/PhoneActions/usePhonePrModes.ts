import { prActions } from "../../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../../shared/reviewButtonModes";
import { reviewModeEntries } from "../../App/reviewModeEntries";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";

const phonePrModes = [
	...reviewButtonModes.filter((mode) => !mode.args.includes("--high-level")),
	...prActions.filter((action) => action.featureId),
];

export function usePhonePrModes(node: string | undefined) {
	return reviewModeEntries(useHarnessCapabilities(node), phonePrModes);
}
