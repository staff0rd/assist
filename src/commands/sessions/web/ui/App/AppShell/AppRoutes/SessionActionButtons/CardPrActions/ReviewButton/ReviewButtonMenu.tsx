import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { reviewButtonModes } from "../../../../reviewButtonModes";
import { ReviewOptionToggles } from "../../../../ReviewOptionToggles";
import type { useReviewLaunch } from "./useReviewLaunch";

export function ReviewButtonMenu({
	anchorEl,
	onClose,
	review,
}: {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	review: ReturnType<typeof useReviewLaunch>;
}) {
	const pick = (e: { stopPropagation: () => void }, run: () => void) => {
		e.stopPropagation();
		onClose();
		run();
	};

	return (
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			onClick={(e) => e.stopPropagation()}
		>
			{reviewButtonModes.map((mode) => (
				<MenuItem
					key={mode.label}
					onClick={(e) => pick(e, () => review.launchMode(mode.args))}
				>
					{mode.label}
				</MenuItem>
			))}
			<Divider />
			<ReviewOptionToggles
				value={review.options}
				onChange={review.setOptions}
			/>
			<Divider />
			<MenuItem onClick={(e) => pick(e, review.launchAddressComments)}>
				Address Comments
			</MenuItem>
		</Menu>
	);
}
