import { useState } from "react";
import type { PrSummary } from "../../../../../../../prList";
import { prLaunchMeta } from "../../../../prLaunchMeta";
import {
	type ReviewOptions,
	reviewOptionArgs,
	reviewOptionDefaults,
} from "../../../../ReviewOptionToggles";
import { useSessionLaunchContext } from "../../../../../../useSessionLaunchContext";

export function useReviewLaunch(
	cwd: string,
	pr: PrSummary,
	launchedFrom?: string,
): {
	options: ReviewOptions;
	setOptions: (options: ReviewOptions) => void;
	resetOptions: () => void;
	launchMode: (modeArgs: string[]) => void;
	launchAddressComments: () => void;
} {
	const { launchAssist } = useSessionLaunchContext();
	const [options, setOptions] = useState(reviewOptionDefaults);
	const meta = { ...prLaunchMeta(pr), inPlace: true, launchedFrom };
	const launch = (args: string[]) => launchAssist(args, cwd, meta);

	return {
		options,
		setOptions,
		resetOptions: () => setOptions(reviewOptionDefaults),
		launchMode: (modeArgs) =>
			launch([...modeArgs, String(pr.number), ...reviewOptionArgs(options)]),
		launchAddressComments: () =>
			launch(["review-pr-comments", String(pr.number)]),
	};
}
