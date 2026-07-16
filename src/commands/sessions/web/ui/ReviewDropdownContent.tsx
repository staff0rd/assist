import type { PrSummary } from "../prList";
import { ReviewPrList } from "./ReviewPrList";

export function ReviewDropdownContent({
	cwd,
	onPick,
}: {
	cwd: string;
	onPick: (pr: PrSummary) => void;
}) {
	return <ReviewPrList cwd={cwd} onPick={onPick} />;
}
