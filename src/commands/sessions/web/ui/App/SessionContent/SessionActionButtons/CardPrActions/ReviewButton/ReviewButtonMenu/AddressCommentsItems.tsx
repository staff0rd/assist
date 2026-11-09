import MenuItem from "@mui/material/MenuItem";
import { addressCommentsActions } from "../../../../../../../../../../shared/prActions";
import { useApiNode } from "../../../../../../useApiNode";
import { useHarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { useReviewLaunch } from "../useReviewLaunch";

export function AddressCommentsItems({
	review,
	pick,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
}) {
	const capabilities = useHarnessCapabilities(useApiNode());
	return reviewModeEntries(capabilities, addressCommentsActions).map(
		({ label, args }) => (
			<MenuItem
				key={label}
				onClick={(e) =>
					pick(e, () => review.launchAddressComments(args.slice(1)))
				}
			>
				{label}
			</MenuItem>
		),
	);
}
