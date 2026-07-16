import { useState } from "react";
import type { PrSummary } from "../prList";
import { DropdownWrapper } from "./DropdownWrapper";
import { useOpenPrs } from "./useOpenPrs";
import { ReviewDropdownContent } from "./ReviewDropdownContent";
import { ReviewTypeDialog } from "./ReviewTypeDialog";

export function ReviewDropdown({
	cwd,
	disabled,
	onSelect,
}: {
	cwd: string;
	disabled: boolean;
	onSelect: (pr: PrSummary, args: string[]) => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);
	const [selectedPr, setSelectedPr] = useState<PrSummary | null>(null);

	if (loading || prs.length === 0) {
		return null;
	}

	return (
		<>
			<DropdownWrapper label="review" disabled={disabled}>
				{(close) => (
					<ReviewDropdownContent
						cwd={cwd}
						onPick={(pr) => {
							setSelectedPr(pr);
							close();
						}}
					/>
				)}
			</DropdownWrapper>
			{selectedPr && (
				<ReviewTypeDialog
					pr={selectedPr}
					onSelect={(args) => {
						onSelect(selectedPr, args);
						setSelectedPr(null);
					}}
					onCancel={() => setSelectedPr(null)}
				/>
			)}
		</>
	);
}
