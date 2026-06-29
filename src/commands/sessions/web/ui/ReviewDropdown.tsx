import type { PrSummary } from "../prList";
import { DropdownWrapper } from "./DropdownWrapper";
import { ReviewPrList } from "./ReviewPrList";
import { useOpenPrs } from "./useOpenPrs";

export function ReviewDropdown({
	cwd,
	disabled,
	onSelect,
}: {
	cwd: string;
	disabled: boolean;
	onSelect: (pr: PrSummary) => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);

	if (loading || prs.length === 0) {
		return null;
	}

	return (
		<DropdownWrapper label="review" disabled={disabled}>
			{(close) => (
				<ReviewPrList
					cwd={cwd}
					onPick={(pr) => {
						onSelect(pr);
						close();
					}}
				/>
			)}
		</DropdownWrapper>
	);
}
