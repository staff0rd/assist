import type { PrSummary } from "../prList";
import { DropdownWrapper } from "./DropdownWrapper";
import { ReviewPrList } from "./ReviewPrList";

export function ReviewDropdown({
	cwd,
	disabled,
	onSelect,
}: {
	cwd: string;
	disabled: boolean;
	onSelect: (pr: PrSummary) => void;
}) {
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
