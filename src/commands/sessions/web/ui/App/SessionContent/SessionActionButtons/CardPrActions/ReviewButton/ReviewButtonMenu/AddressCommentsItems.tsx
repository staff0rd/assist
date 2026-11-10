import MenuItem from "@mui/material/MenuItem";
import { addressCommentsActions } from "../../../../../../../../../../shared/prActions";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { useReviewLaunch } from "../useReviewLaunch";

export function AddressCommentsItems({
	review,
	pick,
	capabilities,
	harness,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
	capabilities: HarnessCapabilities;
	harness: HarnessKind;
}) {
	return reviewModeEntries(capabilities, addressCommentsActions, harness).map(
		({ label, args, disabled }) => (
			<MenuItem
				key={label}
				disabled={disabled}
				onClick={(e) =>
					pick(e, () => review.launchAddressComments(args.slice(1)))
				}
			>
				{label}
			</MenuItem>
		),
	);
}
