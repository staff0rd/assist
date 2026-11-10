import { addressCommentsActions } from "../../../../../../../../../../shared/prActions";
import type { HarnessCapabilities } from "../../../../../../useHarnessCapabilities";
import { ReviewMenuRow } from "../../../../../ReviewMenuRow";
import { reviewModeEntries } from "../../../../../reviewModeEntries";
import type { useReviewLaunch } from "../useReviewLaunch";

export function AddressCommentsItems({
	review,
	pick,
	capabilities,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
	capabilities: HarnessCapabilities;
}) {
	return reviewModeEntries(capabilities, addressCommentsActions).map(
		(entry) => (
			<ReviewMenuRow
				key={entry.label}
				entry={entry}
				onSelect={(e, args) =>
					pick(e, () => review.launchAddressComments(args.slice(1)))
				}
			/>
		),
	);
}
