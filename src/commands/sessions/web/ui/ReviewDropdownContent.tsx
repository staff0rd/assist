import type { PrSummary } from "../prList";
import { ReviewPrList } from "./ReviewPrList";

export function ReviewDropdownContent({
	cwd,
	onPick,
	close,
}: {
	cwd: string;
	onPick: (pr: PrSummary) => void;
	close: () => void;
}) {
	return <ReviewPrList cwd={cwd} onPick={onPick} close={close} />;
}
