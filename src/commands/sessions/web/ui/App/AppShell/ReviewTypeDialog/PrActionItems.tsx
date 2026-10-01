import { Divider, MenuItem } from "@mui/material";
import type { PrSummary } from "../../../../prList";

export function PrActionItems({
	pr,
	onSelect,
	onCancel,
}: {
	pr: PrSummary;
	onSelect: (args: string[]) => void;
	onCancel: () => void;
}) {
	return (
		<>
			<MenuItem onClick={() => onSelect(["review", "--checkout-only"])}>
				Checkout
			</MenuItem>
			<MenuItem onClick={() => onSelect(["review-pr-comments"])}>
				Address Comments
			</MenuItem>
			<MenuItem onClick={() => onSelect(["fix-conflict"])}>
				Fix conflicts (merge)
			</MenuItem>
			<MenuItem onClick={() => onSelect(["fix-conflict", "--rebase"])}>
				Fix conflicts (rebase)
			</MenuItem>
			<Divider />
			<MenuItem
				onClick={() => {
					window.open(pr.url, "_blank");
					onCancel();
				}}
			>
				Open in GitHub
			</MenuItem>
		</>
	);
}
