import MenuItem from "@mui/material/MenuItem";
import type { useReviewLaunch } from "../useReviewLaunch";

const addressCommentsModes = [
	{ label: "Address Comments", args: [] },
	{ label: "Address Comments (auto)", args: ["--auto"] },
];

export function AddressCommentsItems({
	review,
	pick,
}: {
	review: ReturnType<typeof useReviewLaunch>;
	pick: (e: { stopPropagation: () => void }, run: () => void) => void;
}) {
	return addressCommentsModes.map(({ label, args }) => (
		<MenuItem
			key={label}
			onClick={(e) => pick(e, () => review.launchAddressComments(args))}
		>
			{label}
		</MenuItem>
	));
}
