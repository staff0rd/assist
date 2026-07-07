import type { PrSummary } from "../prList";
import { DropdownWrapper } from "./DropdownWrapper";
import { useOpenPrs } from "./useOpenPrs";
import { ReviewDropdownContent } from "./ReviewDropdownContent";

export type ReviewMode = "review" | "review-comments" | "review-post";

export function ReviewDropdown({
	cwd,
	disabled,
	onSelect,
}: {
	cwd: string;
	disabled: boolean;
	onSelect: (pr: PrSummary, mode: ReviewMode) => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);

	if (loading || prs.length === 0) {
		return null;
	}

	return (
		<DropdownWrapper label="review" disabled={disabled}>
			{(close) => (
				<ReviewDropdownContent cwd={cwd} onSelect={onSelect} close={close} />
			)}
		</DropdownWrapper>
	);
}
