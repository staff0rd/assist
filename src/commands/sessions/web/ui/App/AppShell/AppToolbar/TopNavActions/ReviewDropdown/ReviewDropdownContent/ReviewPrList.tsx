import Paper from "@mui/material/Paper";
import type { PrSummary } from "../../../../../../../prList";
import { dropdownStyle } from "../../../../../../DropdownWrapper";
import { FilterInput } from "../../../../../../FilterInput";
import { Message } from "./ReviewPrList/Message";
import { PrMenuList } from "./ReviewPrList/PrMenuList";
import { useOpenPrs } from "../useOpenPrs";
import { usePrListNav } from "./ReviewPrList/usePrListNav";

const paperSx = {
	...dropdownStyle,
	left: "auto",
	width: 320,
	maxHeight: "none",
	overflowY: "visible",
} as const;

export function ReviewPrList({
	cwd,
	onPick,
	close,
}: {
	cwd: string;
	onPick: (pr: PrSummary) => void;
	close: () => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);
	const nav = usePrListNav(prs, onPick, close);

	if (loading || prs.length === 0) {
		return (
			<Paper elevation={4} sx={paperSx}>
				<Message text={loading ? "Loading open PRs…" : "No open PRs"} />
			</Paper>
		);
	}

	return (
		<Paper elevation={4} sx={paperSx}>
			<FilterInput
				autoFocus
				value={nav.filter}
				onChange={nav.setFilter}
				onKeyDown={nav.onKeyDown}
				placeholder="Filter PRs..."
			/>
			{nav.filtered.length === 0 ? (
				<Message text="No PRs match" />
			) : (
				<PrMenuList
					prs={nav.filtered}
					highlight={nav.highlight}
					onHighlight={nav.setHighlight}
					onPick={nav.select}
				/>
			)}
		</Paper>
	);
}
