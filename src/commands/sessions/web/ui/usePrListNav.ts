import { useState } from "react";
import type { PrSummary } from "../prList";
import { filterPrs } from "./filterPrs";
import { useListKeyboardNav } from "./useListKeyboardNav";

export function usePrListNav(
	prs: PrSummary[],
	onPick: (pr: PrSummary) => void,
	close: () => void,
) {
	const [filter, setFilter] = useState("");
	const filtered = filterPrs(prs, filter);
	const { highlight, setHighlight, onKeyDown } = useListKeyboardNav(
		filtered,
		filter,
		onPick,
		close,
	);

	const select = (pr: PrSummary) => {
		onPick(pr);
		close();
	};

	return {
		filter,
		setFilter,
		filtered,
		highlight,
		setHighlight,
		onKeyDown,
		select,
	};
}
